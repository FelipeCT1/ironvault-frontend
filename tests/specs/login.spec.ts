import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Login', () => {

  test('1 - Login válido como admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@ironvault.com');
    await page.fill('[name="senha"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/produtos/);
    await expect(page.locator('.nav-links')).toContainText('Clientes');
    await expect(page.locator('.nav-links')).toContainText('Admin');
  });

  test('2 - Login válido como cliente', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'joao.silva@email.com');
    await page.fill('[name="senha"]', '123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/produtos/);
    await expect(page.locator('.nav-links')).not.toContainText('Clientes');
    await expect(page.locator('.nav-links')).not.toContainText('Admin');
  });

  test('3 - Login inválido mostra erro', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'invalido@email.com');
    await page.fill('[name="senha"]', 'senha_errada');
    await page.click('button[type="submit"]');

    await expect(page.locator('.alert-danger')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
