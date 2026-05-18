import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Admin', () => {

  test('CT-20 - Dashboard com stat-cards', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage.locator('.stat-card')).toHaveCount(4, { timeout: 5000 });
  });

  test('CT-21 - Gerenciar pedidos carrega', async ({ adminPage }) => {
    await adminPage.goto('/admin/pedidos');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Pedidos', { timeout: 5000 });
  });

  test('CT-22 - Ações de pedidos visíveis por status', async ({ adminPage }) => {
    await adminPage.goto('/admin/pedidos');
    await adminPage.waitForTimeout(1000);
    const rows = adminPage.locator('table tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const status = await row.locator('td').nth(3).innerText({ timeout: 2000 }).catch(() => '');

      if (status.includes('EM_PROCESSAMENTO') || status.includes('Processamento')) {
        await expect(row.locator('button:has-text("Aprovar")')).toBeVisible({ timeout: 2000 });
        await expect(row.locator('button:has-text("Reprovar")')).toBeVisible({ timeout: 2000 });
      } else if (status.includes('APROVADA') || status.includes('Aprovada')) {
        await expect(row.locator('button:has-text("Despachar")')).toBeVisible({ timeout: 2000 });
      } else if (status.includes('EM_TRANSITO') || status.includes('Trânsito') || status.includes('Transito')) {
        await expect(row.locator('button:has-text("Entregar")')).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('CT-23 - Gerenciar trocas carrega', async ({ adminPage }) => {
    await adminPage.goto('/admin/trocas');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Trocas', { timeout: 5000 });
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 3000 });
  });
});
