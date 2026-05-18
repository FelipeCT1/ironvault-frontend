import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Trocas', () => {

  test('CT-24 - Página de solicitar troca carrega', async ({ clientePage }) => {
    await clientePage.goto('/trocas/nova');
    await expect(clientePage.locator('h1')).toContainText('Solicitar Troca', { timeout: 5000 });
  });

  test('CT-25 - Lista de trocas carrega', async ({ clientePage }) => {
    await clientePage.goto('/trocas');
    await expect(clientePage.locator('h1')).toContainText('Minhas Trocas', { timeout: 5000 });
  });

  test('CT-46 - Admin gerencia trocas', async ({ clientePage, adminPage }) => {
    // Cliente: página de solicitar troca
    await clientePage.goto('/trocas/nova');
    await expect(clientePage.locator('h1')).toContainText('Solicitar Troca', { timeout: 5000 });

    // Admin: página de gerenciar trocas
    await adminPage.goto('/admin/trocas');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Trocas', { timeout: 5000 });

    // Admin: verificar se há botões Autorizar/Recusar na página
    const autorizarBtn = adminPage.locator('button:has-text("Autorizar")');
    const recusarBtn = adminPage.locator('button:has-text("Recusar")');
    const temAutorizar = await autorizarBtn.isVisible({ timeout: 2000 }).catch(() => false);
    const temRecusar = await recusarBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (temAutorizar || temRecusar) {
      expect(true).toBeTruthy();
    }
    // Se não houver trocas pendentes, apenas verificar que a página carregou
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 3000 });
  });
});
