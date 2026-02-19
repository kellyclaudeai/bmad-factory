import { expect, test } from "@playwright/test";

test("root URL is reachable", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("body")).toBeVisible();
});
