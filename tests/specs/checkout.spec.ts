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
    await expect(clientePage.locator('.card:has(.btn-danger)')).toHaveCount(2);
  });

  test('14 - Fluxo checkout completo', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1500);

    const miniCards = clientePage.locator('.mini-card');
    const total = await miniCards.count();
    expect(total).toBeGreaterThanOrEqual(3);

    await miniCards.first().click();
    await clientePage.waitForTimeout(800);

    const freteCards = clientePage.locator('.card').filter({ hasText: 'Frete' }).locator('.mini-card');
    if (await freteCards.first().isVisible().catch(() => false)) {
      await freteCards.first().click();
      await clientePage.waitForTimeout(500);
    }

    const pagamentoCards = clientePage.locator('.card').filter({ hasText: 'Pagamento' }).locator('.mini-card');
    if (await pagamentoCards.first().isVisible().catch(() => false)) {
      await pagamentoCards.first().click();
      await clientePage.waitForTimeout(500);
    }

    const botao = clientePage.locator('.btn-checkout');
    await expect(botao).toBeEnabled({ timeout: 5000 });
    await botao.click();
    await clientePage.waitForResponse((resp) => resp.url().includes('/api/v1/vendas') && resp.status() === 200, { timeout: 10000 });
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
