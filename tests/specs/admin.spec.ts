import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Admin', () => {

  test('20 - Dashboard com stat-cards', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage.locator('.stat-card')).toHaveCount(4);
  });

  test('21 - Gerenciar pedidos carrega', async ({ adminPage }) => {
    await adminPage.goto('/admin/pedidos');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Pedidos');
  });

  test('22 - Ações de pedidos visíveis', async ({ adminPage }) => {
    await adminPage.goto('/admin/pedidos');
    await adminPage.waitForTimeout(500);
    const rows = adminPage.locator('table tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const status = await row.locator('td').nth(3).innerText();
      if (status === 'EM_PROCESSAMENTO') {
        await expect(row.locator('button:has-text("Aprovar")')).toBeVisible();
        await expect(row.locator('button:has-text("Reprovar")')).toBeVisible();
      }
    }
  });

  test('23 - Gerenciar trocas carrega', async ({ adminPage }) => {
    await adminPage.goto('/admin/trocas');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Trocas');
  });
});
