import { test, expect } from '@playwright/test'

test('core inventory loop', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('owner@vanorika.test')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/dashboard/)

  // Bonus: confirm the seeded demo tenant data is wired up
  await page.goto('/products')
  await expect(page.getByText('Cement 50kg')).toBeVisible()

  // Add a product (unique name + SKU so repeat runs don't collide)
  await page.goto('/products/new')
  const stamp = Date.now()
  const name = 'E2E Widget ' + stamp
  await page.getByLabel('Product name').fill(name)
  await page.getByLabel('SKU').fill('E2E' + stamp)
  await page.getByLabel('Cost price').fill('2')
  await page.getByLabel('Sell price').fill('5')
  await page.getByRole('button', { name: 'Add product' }).click()
  await expect(page).toHaveURL(/\/products$/)

  // Open it, receive 10
  await page.getByText(name).click()
  await page.getByRole('button', { name: 'Receive' }).click()
  await page.getByPlaceholder('Quantity').fill('10')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('10', { exact: false }).first()).toBeVisible()

  // Adjust to 7; the ledger timeline records a "Received" movement
  await page.getByRole('button', { name: 'Adjust' }).click()
  await page.getByPlaceholder('New count').fill('7')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('Received').first()).toBeVisible()
})
