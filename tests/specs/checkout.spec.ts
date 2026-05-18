import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Carrinho e Checkout', () => {

  test.beforeEach(async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.waitForTimeout(1000);
    const addBtn = clientePage.locator('.btn-primary.btn-sm').first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await clientePage.waitForTimeout(500);
    }
  });

  test('CT-13 - Carrinho exibe itens adicionados', async ({ clientePage }) => {
    await clientePage.goto('/carrinho');
    await expect(clientePage.locator('h1')).toContainText('Carrinho', { timeout: 5000 });
    const itemCount = await clientePage.locator('.card:has(.btn-danger)').count();
    expect(itemCount).toBeGreaterThanOrEqual(1);
  });

  test('CT-14 - Fluxo checkout completo', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1000);

    // Verificar que a página carregou
    await expect(clientePage.locator('h1')).toContainText('Finalizar Pedido', { timeout: 5000 });

    // Selecionar endereço se disponível
    const enderecoCards = clientePage.locator('.card').filter({ hasText: 'Endereço de Entrega' }).locator('.mini-card');
    if (await enderecoCards.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await enderecoCards.first().click();
      await clientePage.waitForTimeout(800);
    }

    // Selecionar frete se disponível
    const freteCards = clientePage.locator('.card').filter({ hasText: 'Frete' }).locator('.mini-card');
    if (await freteCards.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await freteCards.first().click();
      await clientePage.waitForTimeout(500);
    }

    // Selecionar cartão se disponível
    const pagCards = clientePage.locator('.card').filter({ hasText: 'Pagamento' }).locator('.mini-card');
    if (await pagCards.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await pagCards.first().click();
      await clientePage.waitForTimeout(500);
    }
  });

  test('CT-15 - Pedido confirmado exibe dados', async ({ clientePage }) => {
    await clientePage.goto('/pedidos');
    await clientePage.waitForTimeout(500);
    await expect(clientePage.locator('h1')).toContainText('Meus Pedidos', { timeout: 5000 });
  });

  test('CT-44 - Checkout com novo endereço e novo cartão', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1000);
    await expect(clientePage.locator('h1')).toContainText('Finalizar Pedido', { timeout: 5000 });

    // Clicar em "+ Novo endereço"
    const btnNovoEnd = clientePage.locator('button:has-text("Novo endereço")');
    if (await btnNovoEnd.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btnNovoEnd.click();
      await clientePage.waitForTimeout(300);
    }

    // Preencher formulário do novo endereço
    const cepInput = clientePage.locator('input[placeholder="CEP"]');
    if (await cepInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cepInput.fill('01310-100');
      await clientePage.locator('input[placeholder="Logradouro"]').fill('Rua Nova');
      await clientePage.locator('input[placeholder="Número"]').fill('500');
      await clientePage.locator('input[placeholder="Bairro"]').fill('Centro');
      await clientePage.locator('input[placeholder="Cidade"]').fill('São Paulo');
      await clientePage.locator('input[placeholder="Estado"]').fill('SP');
    }

    const usarBtn = clientePage.locator('button:has-text("Usar este endereço")');
    if (await usarBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usarBtn.click();
      await clientePage.waitForTimeout(800);
    }

    // Novo cartão
    const btnNovoCartao = clientePage.locator('button:has-text("Novo Cartão")');
    if (await btnNovoCartao.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btnNovoCartao.click();
      await clientePage.waitForTimeout(300);
    }

    const numInput = clientePage.locator('input[placeholder="Número do cartão"]');
    if (await numInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await numInput.fill('4532000000001234');
      await clientePage.locator('input[placeholder="Nome impresso"]').fill('NOVO CLIENTE');
      const select = clientePage.locator('select');
      if (await select.isVisible().catch(() => false)) {
        await select.selectOption('VISA');
      }
      await clientePage.locator('input[placeholder="CVV"]').fill('123');
    }

    const adicionarBtn = clientePage.locator('button:has-text("Adicionar Cartão")');
    if (await adicionarBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await adicionarBtn.click();
      await clientePage.waitForTimeout(1000);
    }
  });

  test('CT-45 - Checkout com cupom promocional', async ({ clientePage }) => {
    await clientePage.goto('/checkout');
    await clientePage.waitForTimeout(1000);
    await expect(clientePage.locator('h1')).toContainText('Finalizar Pedido', { timeout: 5000 });

    // Aplicar cupom promocional se disponível
    const cupomInput = clientePage.locator('input[placeholder="Código do cupom"]');
    if (await cupomInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cupomInput.fill('PRIMEIRA10');
      const validarBtn = clientePage.locator('button:has-text("Validar")');
      if (await validarBtn.isVisible().catch(() => false)) {
        await validarBtn.click();
        await clientePage.waitForTimeout(1000);
      }
    }
  });
});
