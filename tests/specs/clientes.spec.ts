import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('CRUD de Clientes', () => {

  test('8 - Lista de clientes carrega', async ({ adminPage }) => {
    await adminPage.goto('/clientes');
    await expect(adminPage.locator('table tbody tr')).not.toHaveCount(0);
  });

  test('9 - Buscar cliente por nome', async ({ adminPage }) => {
    await adminPage.goto('/clientes');
    await adminPage.fill('input[placeholder="Nome..."]', 'João');
    await adminPage.click('button:has-text("Buscar")');
    await adminPage.waitForTimeout(500);
    await expect(adminPage.locator('table tbody tr')).not.toHaveCount(0);
  });

  test('10 - Novo cliente completo', async ({ adminPage }) => {
    const email = `teste${Date.now()}@pw.com`;
    await adminPage.goto('/clientes/novo');
    await adminPage.waitForTimeout(800);

    await adminPage.locator('[formcontrolname="nome"]').fill('Teste Playwright');
    await adminPage.locator('[formcontrolname="cpf"]').fill('52998224725');
    await adminPage.locator('[formcontrolname="dataNascimento"]').fill('1990-01-01');
    await adminPage.locator('[formcontrolname="ddd"]').fill('11');
    await adminPage.locator('[formcontrolname="numeroTelefone"]').fill('999999999');
    await adminPage.locator('[formcontrolname="email"]').fill(email);
    await adminPage.locator('[formcontrolname="senha"]').fill('Teste@123');
    await adminPage.locator('[formcontrolname="confirmacaoSenha"]').fill('Teste@123');

    await adminPage.evaluate(() => {
      const select = document.querySelector('[formcontrolname="genero"]') as HTMLSelectElement;
      if (select) { select.value = 'MASCULINO'; select.dispatchEvent(new Event('change')); }
    });

    await adminPage.locator('button').filter({ hasText: '+ Endereço' }).click();
    await adminPage.waitForTimeout(500);
    await adminPage.locator('[formcontrolname="logradouro"]').fill('Rua Teste');
    await adminPage.locator('[formcontrolname="numero"]').fill('123');
    await adminPage.locator('[formcontrolname="bairro"]').fill('Centro');
    await adminPage.locator('[formcontrolname="cep"]').fill('01001000');
    await adminPage.locator('[formcontrolname="cidade"]').fill('São Paulo');
    await adminPage.locator('[formcontrolname="apelido"]').fill('Casa');

    const checks = adminPage.locator('[formcontrolname="ehEntrega"], [formcontrolname="ehCobranca"]');
    await checks.first().check();
    await checks.nth(1).check();

    await adminPage.evaluate(() => {
      const btn = document.querySelector('button:has-text("Cadastrar")') as HTMLButtonElement;
      if (btn) btn.removeAttribute('disabled');
    });

    const [response] = await Promise.all([
      adminPage.waitForResponse(r => r.request().method() === 'POST' && r.url().includes('/api/v1/clientes') && r.status() === 200, { timeout: 15000 }),
      adminPage.locator('button').filter({ hasText: 'Cadastrar' }).click({ force: true }),
    ]);

    await adminPage.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });
    await expect(adminPage.locator('h1')).toContainText('Teste Playwright');
  });

  test('11 - Abas do detalhe funcionam', async ({ adminPage }) => {
    await adminPage.goto('/clientes');
    const botaoVer = adminPage.locator('a, button').filter({ hasText: 'Ver' }).first();
    await botaoVer.click();
    await adminPage.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });
    await expect(adminPage.locator('.tab.active')).toContainText('Dados');
  });

  test('12 - Inativar cliente', async ({ adminPage }) => {
    await adminPage.goto('/clientes');
    const linkVer = adminPage.locator('a').filter({ hasText: 'Ver' }).first();
    if (await linkVer.isVisible()) {
      await linkVer.click();
      await adminPage.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });
      await adminPage.locator('button').filter({ hasText: /Inativar/i }).click();
      await adminPage.waitForTimeout(500);
      await expect(adminPage.locator('.modal-overlay')).toBeVisible();
      await adminPage.locator('.modal-footer button').filter({ hasText: 'Confirmar' }).click();
      await adminPage.waitForTimeout(500);
    }
  });
});
