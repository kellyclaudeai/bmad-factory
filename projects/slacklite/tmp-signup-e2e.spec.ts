import { expect, test } from "playwright/test";

interface FirestoreRunQueryRow {
  document?: {
    name: string;
    fields: Record<string, Record<string, unknown>>;
  };
}

const APP_URL = "http://localhost:3100";

async function queryUserDocByEmail(projectId: string, email: string) {
  const response = await fetch(
    `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "users" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "email" },
              op: "EQUAL",
              value: { stringValue: email },
            },
          },
          limit: 1,
        },
      }),
    },
  );

  expect(response.ok).toBeTruthy();

  const rows = (await response.json()) as FirestoreRunQueryRow[];
  return rows.find((row) => row.document)?.document;
}

test("signup creates Firestore user doc and redirects to create-workspace", async ({ page }) => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  expect(projectId).toBeTruthy();

  const email = `story23-${Date.now()}@example.com`;
  const displayName = email.split("@")[0];
  const password = "password123!";

  await page.goto(`${APP_URL}/signup`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByRole("button", { name: /Creating Account\.\.\./i })).toBeVisible();
  await page.waitForURL("**/create-workspace", { timeout: 15000 });

  let document: Awaited<ReturnType<typeof queryUserDocByEmail>>;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    document = await queryUserDocByEmail(projectId as string, email);

    if (document) {
      break;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }

  expect(document).toBeTruthy();

  const docId = (document?.name ?? "").split("/").pop();
  const fields = document?.fields ?? {};

  expect(fields.userId?.stringValue).toBe(docId);
  expect(fields.email?.stringValue).toBe(email);
  expect(fields.displayName?.stringValue).toBe(displayName);
  expect("nullValue" in (fields.workspaceId ?? {})).toBeTruthy();
  expect(typeof fields.createdAt?.timestampValue).toBe("string");
  expect(typeof fields.lastSeenAt?.timestampValue).toBe("string");
  expect(fields.isOnline?.booleanValue).toBe(false);
});
