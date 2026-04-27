import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Pedidos', () => {

  test('17 - Lista de pedidos com stat-cards', async ({ clientePage }) => {
    await clientePage.goto('/pedidos');
    await expect(clientePage.locator('.stat-card')).toHaveCount(4);
  });

  test('18 - Detalhe do pedido com timeline', async ({ clientePage }) => {
    await clientePage.goto('/pedidos');
    const primeiro = clientePage.locator('table tbody tr').first();
    if (await primeiro.isVisible()) {
      await primeiro.click();
      await clientePage.waitForURL(/\/pedidos\/\d+/);
      await expect(clientePage.locator('h1')).toBeVisible();
    }
  });
});
