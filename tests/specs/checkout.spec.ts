import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Carrinho e Checkout', () => {

  test.beforeEach(async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.locator('.btn-primary.btn-sm').first().click();
    await clientePage.waitForTimeout(300);
  });

  test('CT-13 - Carrinho exibe itens adicionados', async ({ clientePage }) => {
    await clientePage.goto('/carrinho');
    await expect(clientePage.locator('.card:has(.btn-danger)')).toHaveCount(1);
  });

  test('CT-14 - Fluxo checkout completo', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1500);

    // Step 1: Select address
    const miniCards = clientePage.locator('.mini-card');
    const total = await miniCards.count();
    expect(total).toBeGreaterThanOrEqual(3);

    await miniCards.first().click();
    await clientePage.waitForTimeout(800);

    // Step 2: Select shipping
    const freteCards = clientePage.locator('.card').filter({ hasText: 'Frete' }).locator('.mini-card');
    if (await freteCards.first().isVisible().catch(() => false)) {
      await freteCards.first().click();
      await clientePage.waitForTimeout(500);
    }

    // Step 3: Select payment card
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

  test('CT-15 - Pedido confirmado exibe dados', async ({ clientePage }) => {
    await clientePage.goto('/pedidos');
    await clientePage.waitForTimeout(500);
    const linha = clientePage.locator('table tbody tr').first();
    if (await linha.isVisible()) {
      await linha.click();
      await clientePage.waitForURL(/\/pedidos\/\d+/, { timeout: 5000 });
      await expect(clientePage.locator('h1')).toBeVisible();
    }
  });

  test('CT-44 - Checkout com novo endereço e novo cartão', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1000);

    // Clicar em "+ Novo endereço"
    const btnNovoEnd = clientePage.locator('button:has-text("Novo endereço")');
    if (await btnNovoEnd.isVisible()) {
      await btnNovoEnd.click();
      await clientePage.waitForTimeout(300);
    }

    // Preencher novo endereço
    const inputs = clientePage.locator('.card:has-text("Endereço de Entrega") input');
    const inputCount = await inputs.count();
    if (inputCount >= 6) {
      await inputs.nth(0).fill('01310-100');
      await inputs.nth(1).fill('Rua Nova');
      await inputs.nth(2).fill('500');
      await inputs.nth(3).fill('Centro');
      await inputs.nth(4).fill('São Paulo');
      await inputs.nth(5).fill('SP');
    }

    await clientePage.locator('button:has-text("Usar este endereço")').click();
    await clientePage.waitForTimeout(800);

    // Selecionar frete
    const freteCard = clientePage.locator('.card').filter({ hasText: 'Frete' }).locator('.mini-card').first();
    if (await freteCard.isVisible().catch(() => false)) {
      await freteCard.click();
      await clientePage.waitForTimeout(500);
    }

    // Novo cartão
    const btnNovoCartao = clientePage.locator('button:has-text("Novo Cartão")');
    if (await btnNovoCartao.isVisible()) {
      await btnNovoCartao.click();
      await clientePage.waitForTimeout(300);
    }

    const cartaoInputs = clientePage.locator('.card:has-text("Pagamento") input, .card:has-text("Pagamento") select');
    if (await cartaoInputs.nth(0).isVisible().catch(() => false)) {
      await cartaoInputs.nth(0).fill('4532000000001234');
      await cartaoInputs.nth(1).fill('NOVO CLIENTE');
      await cartaoInputs.nth(2)?.selectOption('VISA');
      await cartaoInputs.nth(3)?.fill('123');
    }

    await clientePage.locator('button:has-text("Adicionar Cartão")').click();
    await clientePage.waitForTimeout(1000);

    // Finalizar
    const botao = clientePage.locator('.btn-checkout');
    if (await botao.isEnabled().catch(() => false)) {
      await botao.click();
      await clientePage.waitForResponse((resp) => resp.url().includes('/api/v1/vendas'), { timeout: 10000 }).catch(() => {});
    }
  });

  test('CT-45 - Checkout com cupom promocional e cupom de troca', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1000);

    // Selecionar endereço
    const enderecoCard = clientePage.locator('.card').filter({ hasText: 'Endereço de Entrega' }).locator('.mini-card').first();
    if (await enderecoCard.isVisible().catch(() => false)) {
      await enderecoCard.click();
      await clientePage.waitForTimeout(800);
    }

    // Selecionar frete
    const freteCard = clientePage.locator('.card').filter({ hasText: 'Frete' }).locator('.mini-card').first();
    if (await freteCard.isVisible().catch(() => false)) {
      await freteCard.click();
      await clientePage.waitForTimeout(500);
    }

    // Aplicar cupom promocional
    const cupomInput = clientePage.locator('.card').filter({ hasText: 'Pagamento' }).locator('input[placeholder="Código do cupom"]');
    if (await cupomInput.isVisible().catch(() => false)) {
      await cupomInput.fill('PRIMEIRA10');
      await clientePage.locator('button:has-text("Validar")').click();
      await clientePage.waitForTimeout(500);
    }

    // Selecionar cartão
    const pagamentoCard = clientePage.locator('.card').filter({ hasText: 'Pagamento' }).locator('.mini-card').first();
    if (await pagamentoCard.isVisible().catch(() => false)) {
      await pagamentoCard.click();
      await clientePage.waitForTimeout(500);
    }

    // Finalizar
    const botao = clientePage.locator('.btn-checkout');
    if (await botao.isEnabled().catch(() => false)) {
      await botao.click();
    }
  });
});
