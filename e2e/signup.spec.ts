import { test, expect } from "@playwright/test";

test("sign up a new store and add the first product", async ({ page }) => {
  const stamp = Date.now();
  await page.goto("/signup");
  await page.getByLabel("Shop name").fill("E2E Shop " + stamp);
  await page.getByLabel("Your name").fill("E2E Owner");
  await page.getByLabel("Email").fill(`e2e${stamp}@shop.co`);
  await page.getByLabel("Password").fill("password12345");
  await page.getByRole("button", { name: "Create store" }).click();

  // Lands on the (empty) dashboard of the brand-new store
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText("Inventory value")).toBeVisible();

  // Add the first product
  await page.goto("/products/new");
  await page.getByLabel("Product name").fill("First Item");
  await page.getByLabel("SKU").fill("FIRST" + stamp);
  await page.getByLabel("Cost price").fill("1");
  await page.getByLabel("Sell price").fill("2");
  await page.getByRole("button", { name: "Add product" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByText("First Item")).toBeVisible();
});
