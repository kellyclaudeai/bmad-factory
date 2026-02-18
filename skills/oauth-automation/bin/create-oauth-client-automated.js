#!/usr/bin/env node
/**
 * Automated OAuth 2.0 Client Creation via Browser Automation (Playwright)
 *
 * NOTE: Google does not provide a public API for creating standard OAuth clients.
 * This script automates the Cloud Console UI. It can be made *faster* and more
 * resilient, but it will never be as robust as a real API.
 *
 * Usage:
 *   node create-oauth-client-automated.js <gcp-project-id> <app-name> [redirect-uris...]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const [,, gcpProjectId, appName, ...redirectUrisArg] = process.argv;

if (!gcpProjectId || !appName) {
  console.error('Usage: node create-oauth-client-automated.js <gcp-project-id> <app-name> [redirect-uris...]');
  process.exit(1);
}

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

const redirectUris = uniq([
  'http://localhost:3000/auth/callback',
  ...redirectUrisArg,
]);

async function isPortOpen(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(750, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function findRepoProjectDirForGcpProjectId(gcpId) {
  // Prefer direct match (some repos may name the folder as the gcp id)
  const direct = path.join(process.cwd(), 'projects', gcpId);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;

  // Otherwise scan for .firebaserc with default project id
  const projectsRoot = path.join(process.cwd(), 'projects');
  if (!fs.existsSync(projectsRoot)) return null;

  const entries = fs.readdirSync(projectsRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(projectsRoot, d.name));

  for (const dir of entries) {
    const firebaserc = path.join(dir, '.firebaserc');
    if (!fs.existsSync(firebaserc)) continue;
    try {
      const json = JSON.parse(fs.readFileSync(firebaserc, 'utf8'));
      if (json?.projects?.default === gcpId) return dir;
    } catch (_) {}
  }

  return null;
}

async function createOAuthClient() {
  console.log('🤖 Starting automated OAuth client creation...');
  console.log(`Project: ${gcpProjectId}`);
  console.log(`App Name: ${appName}`);
  console.log(`Redirect URIs: ${redirectUris.join(', ')}`);
  console.log('');

  const cdpUrl = 'http://localhost:9222';
  const cdpOk = await isPortOpen(`${cdpUrl}/json/version`);

  if (!cdpOk) {
    console.error('❌ Chrome remote debugging is not available on localhost:9222.');
    console.error('   Start Chrome like:');
    console.error('   open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir="$HOME/.openclaw/chrome-oauth-profile"');
    process.exit(2);
  }

  console.log('🔗 Connecting to existing Chrome instance (CDP :9222)...');

  const browser = await chromium.connectOverCDP(cdpUrl);
  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();

  const screenshotOnFail = async (label) => {
    const out = path.join(process.cwd(), `oauth-automation-${label}-${nowStamp()}.png`);
    try {
      await page.screenshot({ path: out, fullPage: true });
      console.error(`Screenshot saved to: ${out}`);
    } catch (_) {}
  };

  try {
    await page.bringToFront();

    // Go directly to Credentials page
    console.log('📍 Navigating to credentials page...');
    await page.goto(`https://console.cloud.google.com/apis/credentials?project=${encodeURIComponent(gcpProjectId)}`, {
      waitUntil: 'domcontentloaded',
    });

    // If user is signed out, we won't be able to proceed.
    // Detect the common sign-in state early and fail with instructions.
    const maybeSignIn = page.getByRole('link', { name: /sign in/i }).first();
    if (await maybeSignIn.isVisible().catch(() => false)) {
      await screenshotOnFail('signin-required');
      throw new Error('Chrome is not authenticated to Google Cloud Console. Sign in in the opened Chrome window, then re-run.');
    }

    console.log('⏳ Waiting for Credentials UI...');
    // Cloud Console is slow; wait for any “Create credentials” button.
    const createCredsBtn = page.getByRole('button', { name: /create credentials/i });
    await createCredsBtn.waitFor({ timeout: 120000 });

    console.log('🖱️  Clicking Create credentials...');
    await createCredsBtn.click();

    // Menu item can appear as a menuitem or button.
    console.log('🖱️  Selecting OAuth client ID...');
    const oauthItem = page.getByRole('menuitem', { name: /oauth client id/i });
    if (await oauthItem.isVisible().catch(() => false)) {
      await oauthItem.click();
    } else {
      await page.getByText(/oauth client id/i, { exact: false }).click();
    }

    // If consent screen isn't configured, console may redirect to setup flow.
    // We'll try to detect and walk the minimal internal consent flow.
    const configureConsent = page.getByRole('button', { name: /configure consent screen/i });
    if (await configureConsent.isVisible().catch(() => false)) {
      console.log('⚙️  Configuring OAuth consent screen (minimal)...');
      await configureConsent.click();

      // Choose Internal if available
      const internalRadio = page.getByRole('radio', { name: /internal/i });
      if (await internalRadio.isVisible().catch(() => false)) {
        await internalRadio.click();
      }

      const createBtn = page.getByRole('button', { name: /^create$/i });
      if (await createBtn.isVisible().catch(() => false)) await createBtn.click();

      // Fill app name / support email if prompted
      const appNameField = page.getByLabel(/app name|application name/i).first();
      if (await appNameField.isVisible().catch(() => false)) {
        await appNameField.fill(appName);
      }

      const supportEmail = page.getByLabel(/user support email/i).first();
      if (await supportEmail.isVisible().catch(() => false)) {
        // leave as-is if already set; otherwise try to pick first option
        try {
          await supportEmail.click();
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');
        } catch (_) {}
      }

      // Advance through steps
      for (let i = 0; i < 3; i++) {
        const saveContinue = page.getByRole('button', { name: /save and continue/i });
        if (await saveContinue.isVisible().catch(() => false)) {
          await saveContinue.click();
          await page.waitForTimeout(1000);
        }
      }

      // Return to credentials page
      await page.goto(`https://console.cloud.google.com/apis/credentials?project=${encodeURIComponent(gcpProjectId)}`, {
        waitUntil: 'domcontentloaded',
      });
      await createCredsBtn.waitFor({ timeout: 120000 });
      await createCredsBtn.click();
      await page.getByText(/oauth client id/i, { exact: false }).click();
    }

    // OAuth client form
    console.log('🧾 Filling OAuth client form...');

    // Application type: Web application
    // The control varies; try the label, then fallback to clicking text.
    const appType = page.getByLabel(/application type/i).first();
    if (await appType.isVisible().catch(() => false)) {
      await appType.click();
      await page.getByRole('option', { name: /web application/i }).click();
    } else {
      await page.getByText(/application type/i, { exact: false }).click().catch(() => {});
      await page.getByText(/web application/i, { exact: false }).click();
    }

    const nameField = page.getByLabel(/^name$/i).first();
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill(`${appName} Web Client`);
    } else {
      // fallback: first textbox on page
      await page.getByRole('textbox').first().fill(`${appName} Web Client`);
    }

    console.log('📝 Adding redirect URIs...');
    for (const uri of redirectUris) {
      const addUri = page.getByRole('button', { name: /add uri/i });
      await addUri.click();
      // After clicking ADD URI, a textbox appears; fill the last one.
      const boxes = page.getByRole('textbox');
      const count = await boxes.count();
      await boxes.nth(count - 1).fill(uri);
      console.log(`   ✓ ${uri}`);
    }

    console.log('🖱️  Creating client...');
    await page.getByRole('button', { name: /^create$/i }).click();

    console.log('📋 Extracting credentials...');
    // Look for fields with labels containing Client ID / Client secret
    const clientIdField = page.getByLabel(/client id/i).first();
    const clientSecretField = page.getByLabel(/client secret/i).first();

    await clientIdField.waitFor({ timeout: 30000 });
    await clientSecretField.waitFor({ timeout: 30000 });

    const clientId = await clientIdField.inputValue();
    const clientSecret = await clientSecretField.inputValue();

    const envContent = `# Generated by oauth-automation (Playwright)\n# Created: ${new Date().toISOString()}\n\nNEXT_PUBLIC_GOOGLE_CLIENT_ID=${clientId}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`;

    // Write to projects/<gcp-project-id> AND to the repo project dir if found
    const outputs = [];

    const out1 = path.join(process.cwd(), 'projects', gcpProjectId, '.env.oauth');
    fs.mkdirSync(path.dirname(out1), { recursive: true });
    fs.writeFileSync(out1, envContent);
    outputs.push(out1);

    const repoDir = await findRepoProjectDirForGcpProjectId(gcpProjectId);
    if (repoDir && repoDir !== path.join(process.cwd(), 'projects', gcpProjectId)) {
      const out2 = path.join(repoDir, '.env.oauth');
      fs.writeFileSync(out2, envContent);
      outputs.push(out2);
    }

    console.log('\n✅ OAuth client created successfully!');
    console.log(`Client ID: ${clientId}`);
    console.log(`Saved to: ${outputs.join(', ')}`);

    // Close modal if present
    const okBtn = page.getByRole('button', { name: /^ok$/i });
    if (await okBtn.isVisible().catch(() => false)) await okBtn.click();

  } catch (err) {
    console.error(`\n❌ Error creating OAuth client: ${err.message}`);
    await screenshotOnFail('error');
    process.exitCode = 1;
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

createOAuthClient();
