import { expect, test } from '@playwright/test'

test('shows an empty list on first visit', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Todo App' })).toBeVisible()
  await expect(page.getByText('No todos yet. Add one above.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'all (0)' })).toBeVisible()
})

test('adds a todo and marks it complete', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('New todo').fill('Buy milk')
  await page.getByRole('button', { name: 'Add' }).click()

  const item = page.getByRole('listitem').filter({ hasText: 'Buy milk' })
  await expect(item).toBeVisible()

  await item.getByRole('checkbox').check()
  await expect(item.getByRole('checkbox')).toBeChecked()
  await expect(page.getByRole('button', { name: 'completed (1)' })).toBeVisible()
})
