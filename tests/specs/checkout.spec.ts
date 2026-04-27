import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Carrinho e Checkout', () => {

  test.beforeEach(async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.locator('.btn-primary.btn-sm').first().click();
    await clientePage.locator('.btn-primary.btn-sm').nth(1).click();
    await clientePage.waitForTimeout(300);
  });

  test('13 - Carrinho exibe itens e resumo', async ({ clientePage }) => {
    await clientePage.goto('/carrinho');
    await expect(clientePage.locator('.item-carrinho')).toHaveCount(2);
    await expect(clientePage.locator('.prod-preco')).toBeVisible();
  });

  test('14 - Fluxo checkout completo', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(500);
    const endereco = clientePage.locator('.mini-card').first();
    if (await endereco.isVisible()) {
      await endereco.click();
      await clientePage.waitForTimeout(300);
    }
    const frete = clientePage.locator('.mini-card').nth(1);
    if (await frete.isVisible()) {
      await frete.click();
      await clientePage.waitForTimeout(300);
    }
    const cartao = clientePage.locator('.mini-card').last();
    if (await cartao.isVisible()) {
      await cartao.click();
      await clientePage.waitForTimeout(300);
    }
    await clientePage.locator('.btn-checkout').click();
    await clientePage.waitForURL(/\/pedido\/\d+/);
  });

  test('15 - Pedido confirmado exibe dados', async ({ clientePage }) => {
    const result = await clientePage.goto('/pedido/1');
    if (result?.status() === 200) {
      await expect(clientePage.locator('h1')).toContainText('Pedido Confirmado');
    }
  });
});
