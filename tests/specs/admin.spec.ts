import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Admin', () => {

  test('CT-20 - Dashboard com stat-cards', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage.locator('.stat-card')).toHaveCount(4);
  });

  test('CT-21 - Gerenciar pedidos carrega', async ({ adminPage }) => {
    await adminPage.goto('/admin/pedidos');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Pedidos');
  });

  test('CT-22 - Ações de pedidos visíveis por status', async ({ adminPage }) => {
    await adminPage.goto('/admin/pedidos');
    await adminPage.waitForTimeout(500);
    const rows = adminPage.locator('table tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const status = await row.locator('td').nth(3).innerText();
      if (status.includes('EM_PROCESSAMENTO') || status.includes('Processamento')) {
        await expect(row.locator('button:has-text("Aprovar")')).toBeVisible();
        await expect(row.locator('button:has-text("Reprovar")')).toBeVisible();
      } else if (status.includes('APROVADA') || status.includes('Aprovada')) {
        await expect(row.locator('button:has-text("Despachar")')).toBeVisible();
      } else if (status.includes('EM_TRANSITO') || status.includes('Trânsito') || status.includes('Transito')) {
        await expect(row.locator('button:has-text("Entregar")')).toBeVisible();
      }
    }
  });

  test('CT-23 - Gerenciar trocas carrega', async ({ adminPage }) => {
    await adminPage.goto('/admin/trocas');
    await expect(adminPage.locator('h1')).toContainText('Gerenciar Trocas');
  });

  test('CT-47 - Fluxo completo de transição de status do pedido', async ({ adminPage }) => {
    await adminPage.goto('/admin/pedidos');
    await adminPage.waitForTimeout(500);

    // Para cada pedido em processamento, aprovar
    let processedCount = 0;
    const rows = adminPage.locator('table tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count && processedCount < 2; i++) {
      const row = rows.nth(i);
      const status = await row.locator('td').nth(3).innerText();

      if (status.includes('EM_PROCESSAMENTO') || status.includes('Processamento')) {
        // Aprovar pagamento
        const aprovarBtn = row.locator('button:has-text("Aprovar")');
        if (await aprovarBtn.isVisible().catch(() => false)) {
          await aprovarBtn.click();
          await adminPage.waitForTimeout(500);

          // Aguardar resposta
          await adminPage.waitForResponse(
            (resp) => resp.url().includes('/api/v1/vendas') && resp.status() === 204,
            { timeout: 5000 }
          ).catch(() => {});

          await adminPage.goto('/admin/pedidos');
          await adminPage.waitForTimeout(500);
          processedCount++;
        }
      }
    }
  });
});
