import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Pedidos', () => {

  test('17 - Lista de pedidos carrega', async ({ clientePage }) => {
    await clientePage.goto('/pedidos');
    await expect(clientePage.locator('h1')).toContainText('Meus Pedidos');
    const temPedidos = await clientePage.locator('table tbody tr').first().isVisible();
    if (temPedidos) {
      await expect(clientePage.locator('.stat-card').first()).toBeVisible();
    }
  });

  test('18 - Detalhe do pedido com timeline', async ({ clientePage }) => {
    await clientePage.goto('/pedidos');
    const primeiraLinha = clientePage.locator('table tbody tr').first();
    if (await primeiraLinha.isVisible()) {
      await primeiraLinha.click();
      await clientePage.waitForURL(/\/pedidos\/\d+/, { timeout: 10000 });
      await expect(clientePage.locator('h1')).toBeVisible();
    }
  });
});
