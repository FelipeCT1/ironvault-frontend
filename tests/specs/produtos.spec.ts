import { test, expect } from '@playwright/test';

test.describe('Catálogo de Produtos', () => {

  test('4 - Listagem carrega 8 produtos do DataInitializer', async ({ page }) => {
    await page.goto('/produtos');
    await expect(page.locator('.card-produto-mini')).toHaveCount(8);
  });

  test('5 - Filtro por nome', async ({ page }) => {
    await page.goto('/produtos');
    await page.fill('input[placeholder*="Buscar"]', 'Whey');
    await page.waitForTimeout(500);

    const cards = page.locator('.card-produto-mini');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText('Whey', { ignoreCase: true });
    }
  });

  test('6 - Filtro por categoria', async ({ page }) => {
    await page.goto('/produtos');
    await page.selectOption('select', '1');
    await page.waitForTimeout(500);

    const cards = page.locator('.card-produto-mini');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('7 - Adicionar ao carrinho atualiza badge', async ({ page }) => {
    await page.goto('/produtos');
    await page.locator('.btn-primary.btn-sm').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('.badge')).toBeVisible();
  });
});
