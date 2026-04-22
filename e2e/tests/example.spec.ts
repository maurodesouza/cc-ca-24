import { test, expect } from '@playwright/test';

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}


test('Deve criar uma conta', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.getByRole('textbox', { name: 'Name' }).fill(validInput.name);
  await page.getByRole('textbox', { name: 'Email' }).fill(validInput.email);
  await page.getByRole('textbox', { name: 'Document' }).fill(validInput.document);
  await page.getByRole('textbox', { name: 'Password' }).fill(validInput.password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.locator('text=Success')).toBeVisible();
});
