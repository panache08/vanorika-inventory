import { test, expect } from '@playwright/test'

test('core inventory loop', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('Email').fill('owner@vanorika.test')
  await page.getByPlaceholder('Password').fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/dashboard/)

  // Bonus: confirm the seeded demo tenant data is wired up
  await page.goto('/products')
  await expect(page.getByText('Cement 50kg')).toBeVisible()

  // Add a product
  await page.goto('/products/new')
  const sku = 'E2E' + Date.now()
  await page.getByPlaceholder('Product name').fill('Test Widget')
  await page.getByPlaceholder('SKU').fill(sku)
  await page.getByPlaceholder('Cost price').fill('2')
  await page.getByPlaceholder('Sell price').fill('5')
  await page.getByRole('button', { name: 'Add product' }).click()
  await expect(page).toHaveURL(/\/products$/)

  // Open it, receive 10
  await page.getByText('Test Widget').click()
  await page.getByRole('button', { name: 'Receive' }).click()
  await page.getByPlaceholder('Quantity').fill('10')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('10', { exact: false }).first()).toBeVisible()

  // Adjust to 7, timeline shows RECEIVE
  await page.getByRole('button', { name: 'Adjust' }).click()
  await page.getByPlaceholder('New count').fill('7')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('RECEIVE').first()).toBeVisible()
})
