import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Carrinho e Checkout', () => {

  test.beforeEach(async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.locator('.btn-primary.btn-sm').first().click();
    await clientePage.locator('.btn-primary.btn-sm').nth(1).click();
    await clientePage.waitForTimeout(500);
  });

  test('13 - Carrinho exibe itens adicionados', async ({ clientePage }) => {
    await clientePage.goto('/carrinho');
    await expect(clientePage.locator('.card')).toHaveCount(2);
    await expect(clientePage.locator('.prod-preco')).toBeVisible();
  });

  test('14 - Fluxo checkout completo', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1000);

    const miniCards = clientePage.locator('.mini-card');
    const count = await miniCards.count();

    if (count >= 3) {
      await miniCards.nth(0).click();
      await clientePage.waitForTimeout(500);
      await miniCards.nth(1).click();
      await clientePage.waitForTimeout(500);
      await miniCards.nth(2).click();
      await clientePage.waitForTimeout(500);
    }

    const botao = clientePage.locator('.btn-checkout');
    if (await botao.isEnabled()) {
      await botao.click();
      await clientePage.waitForResponse((resp) => resp.url().includes('/api/v1/vendas') && resp.status() === 200);
      await expect(clientePage).toHaveURL(/\/pedido\/\d+/);
    }
  });

  test('15 - Pedido confirmado exibe dados', async ({ clientePage }) => {
    await clientePage.goto('/pedidos');
    await clientePage.waitForTimeout(500);
    const primeiraLinha = clientePage.locator('table tbody tr').first();
    if (await primeiraLinha.isVisible()) {
      const href = await primeiraLinha.locator('a').getAttribute('href');
      if (href) {
        await clientePage.goto(href);
        await expect(clientePage.locator('.card-titulo')).toBeVisible();
      }
    }
  });
});
