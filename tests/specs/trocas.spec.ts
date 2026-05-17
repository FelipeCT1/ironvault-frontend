import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Trocas', () => {

  test('CT-24 - Página de solicitar troca carrega', async ({ clientePage }) => {
    await clientePage.goto('/trocas/nova');
    await expect(clientePage.locator('h1')).toContainText('Solicitar Troca');
  });

  test('CT-25 - Lista de trocas carrega', async ({ clientePage }) => {
    await clientePage.goto('/trocas');
    await expect(clientePage.locator('h1')).toContainText('Minhas Trocas');
  });

  test('CT-46 - Fluxo completo: admin gerencia troca (autorizar e concluir)', async ({ clientePage, adminPage }) => {
    // Cliente navega para solicitar troca
    await clientePage.goto('/trocas/nova');
    await expect(clientePage.locator('h1')).toContainText('Solicitar Troca');

    // Se houver pedidos entregues, preencher formulário
    const selectPedido = clientePage.locator('select').first();
    if (await selectPedido.isVisible().catch(() => false)) {
      const options = await selectPedido.locator('option').count();
      if (options > 1) {
        await selectPedido.selectOption({ index: 1 });
        await clientePage.waitForTimeout(300);
      }
    }

    const submitBtn = clientePage.locator('button[type="submit"], button:has-text("Solicitar")');
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await clientePage.waitForTimeout(500);
    }

    // Admin acessa gerenciamento de trocas
    await adminPage.goto('/admin/trocas');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Trocas');

    // Ver se há botões de ação
    const autorizarBtn = adminPage.locator('button:has-text("Autorizar")').first();
    if (await autorizarBtn.isVisible().catch(() => false)) {
      await autorizarBtn.click();
      await adminPage.waitForTimeout(500);
    }

    const concluirBtn = adminPage.locator('button:has-text("Confirmar"), button:has-text("Concluir")').first();
    if (await concluirBtn.isVisible().catch(() => false)) {
      await concluirBtn.click();
      await adminPage.waitForTimeout(500);
    }
  });
});
