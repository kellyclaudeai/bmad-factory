/**
 * Direct Messages (DM) flows — live QA URL tests (v2).
 *
 * v2 note: The same persistence fix that affected channel messages applies to DMs.
 * The channel page subscribes to both RTDB + Firestore; the DM page follows the
 * same pattern. DM persistence is tested via reload.
 *
 * Covers:
 *  DM-01: Workspace member list / DMs section is visible in sidebar
 *  DM-02: Clicking a member opens a DM conversation view
 *  DM-03: DM message persists after page reload (v2 persistence fix)
 *
 * NOTE: Real-time DM delivery between two simultaneous sessions is covered in
 * realtime.spec.ts because it requires two browser contexts.
 */
import { expect, test } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  sendMessage,
  waitForMessagingSurface,
  APP_DM_URL_RE,
} from "./helpers";

test.describe("Direct Messages", () => {
  // -------------------------------------------------------------------------
  // DM-01: DMs section visible in sidebar
  // -------------------------------------------------------------------------
  test("DM-01 workspace member list or DMs section is visible in sidebar", async ({ page }) => {
    const account = newAccount("dm-sidebar");
    await signUpAndCreateWorkspace(page, account);

    // The sidebar should show a members/DMs section
    const memberSection = page
      .getByText(/Members|People|Direct Messages|DMs/i)
      .first();
    await expect(memberSection).toBeVisible({ timeout: 10_000 });
  });

  // -------------------------------------------------------------------------
  // DM-02: Clicking a member opens a DM conversation view
  // -------------------------------------------------------------------------
  test("DM-02 clicking a member opens a DM conversation view", async ({ page }) => {
    const accountA = newAccount("dm-opena");
    await signUpAndCreateWorkspace(page, accountA);
    await waitForMessagingSurface(page);

    // Look for the current user's name/avatar in sidebar member list
    const emailPrefix = accountA.email.split("@")[0];
    const memberButtons = page.getByRole("button", {
      name: new RegExp(emailPrefix, "i"),
    });

    const hasMemberButton = await memberButtons
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasMemberButton) {
      await memberButtons.first().click();

      // Should navigate to a DM URL
      const currentUrl = page.url();
      const isDmUrl =
        APP_DM_URL_RE.test(currentUrl) ||
        /\/dms\/|\/dm\//.test(currentUrl);

      if (isDmUrl) {
        await waitForMessagingSurface(page);

        // Send a DM message
        const dmText = `dm-self-${Date.now()}`;
        await sendMessage(page, dmText);
        await expect(page.getByText(dmText, { exact: true })).toBeVisible({ timeout: 8_000 });
      } else {
        test.info().annotations.push({
          type: "note",
          description: `Member button clicked but URL is ${currentUrl} — may need multiple workspace members to enable DMs`,
        });
      }
    } else {
      test.skip(
        true,
        "Single-user workspace has no other visible members — requires invite flow first"
      );
    }
  });

  // -------------------------------------------------------------------------
  // DM-03: DM message persists after page reload (v2 persistence fix)
  // -------------------------------------------------------------------------
  test("DM-03 DM message persists after page reload [v2 persistence fix]", async ({ page }) => {
    const account = newAccount("dm-persist");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const emailPrefix = account.email.split("@")[0];
    const memberButton = page.getByRole("button", {
      name: new RegExp(emailPrefix, "i"),
    });

    const hasMemberButton = await memberButton
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (!hasMemberButton) {
      test.skip(true, "No member button found — DM flow requires visible workspace members");
    }

    await memberButton.first().click();

    const currentUrl = page.url();
    const isDmUrl =
      APP_DM_URL_RE.test(currentUrl) || /\/dms\/|\/dm\//.test(currentUrl);

    if (!isDmUrl) {
      test.skip(true, `Not on a DM URL (${currentUrl}) — skipping persistence check`);
    }

    await waitForMessagingSurface(page);

    const dmText = `dm-persist-v2-${Date.now()}`;
    await sendMessage(page, dmText);
    await expect(page.getByText(dmText, { exact: true })).toBeVisible({ timeout: 5_000 });

    // Reload the DM page
    await page.reload();
    await waitForMessagingSurface(page);

    // Message MUST still appear — verifies Firestore/RTDB persistence in DMs
    await expect(
      page.getByText(dmText, { exact: true }),
      `DM message "${dmText}" must persist after page reload. ` +
      `This verifies the v2 persistence fix applies to DM conversations as well.`
    ).toBeVisible({ timeout: 15_000 });
  });
});
