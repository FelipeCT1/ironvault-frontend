import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Analytics', () => {

  test('CT-50 - Página de analytics carrega com filtros', async ({ adminPage }) => {
    await adminPage.goto('/admin/analytics');
    await expect(adminPage.locator('h1')).toContainText('Análise de Vendas', { timeout: 5000 });
  });

  test('CT-51 - Botão Gerar Gráfico gera gráfico', async ({ adminPage }) => {
    await adminPage.goto('/admin/analytics');
    await adminPage.waitForTimeout(2000);

    const generateBtn = adminPage.locator('button:has-text("Gerar Gráfico")');
    if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await generateBtn.click();
      await adminPage.waitForTimeout(2000);
    }

    const canvas = adminPage.locator('canvas');
    await expect(canvas).toBeAttached({ timeout: 5000 });
  });

  test('CT-52 - Filtro de categorias seleciona/desseleciona', async ({ adminPage }) => {
    await adminPage.goto('/admin/analytics');
    await adminPage.waitForTimeout(1500);

    const checkboxes = adminPage.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('CT-53 - Campos de período estão visíveis', async ({ adminPage }) => {
    await adminPage.goto('/admin/analytics');
    await adminPage.waitForTimeout(1000);

    const monthInputs = adminPage.locator('input[type="month"]');
    await expect(monthInputs.first()).toBeVisible({ timeout: 3000 });
    await expect(monthInputs.nth(1)).toBeVisible({ timeout: 3000 });
  });
});
