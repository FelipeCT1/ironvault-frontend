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
    await adminPage.fill('input[formcontrolname="nome"]', 'Teste Playwright');
    await adminPage.fill('input[formcontrolname="cpf"]', '52998224725');
    await adminPage.fill('input[formcontrolname="dataNascimento"]', '1990-01-01');
    await adminPage.selectOption('select[formcontrolname="genero"]', 'MASCULINO');
    await adminPage.fill('input[formcontrolname="ddd"]', '11');
    await adminPage.fill('input[formcontrolname="numeroTelefone"]', '999999999');
    await adminPage.fill('input[formcontrolname="email"]', email);
    await adminPage.fill('input[formcontrolname="senha"]', 'Teste@123');
    await adminPage.fill('input[formcontrolname="confirmacaoSenha"]', 'Teste@123');

    await adminPage.locator('button').filter({ hasText: '+ Endereço' }).click();
    await adminPage.waitForTimeout(300);
    const endForm = adminPage.locator('[formarrayname="enderecos"] [formgroupname="0"]');
    await endForm.locator('[formcontrolname="logradouro"]').fill('Rua Teste');
    await endForm.locator('[formcontrolname="numero"]').fill('123');
    await endForm.locator('[formcontrolname="bairro"]').fill('Centro');
    await endForm.locator('[formcontrolname="cep"]').fill('01001000');
    await endForm.locator('[formcontrolname="cidade"]').fill('São Paulo');
    await endForm.locator('[formcontrolname="estado"]').fill('SP');
    await endForm.locator('[formcontrolname="apelido"]').fill('Casa');
    await endForm.locator('input[type="checkbox"]').first().check();
    await endForm.locator('input[type="checkbox"]').nth(1).check();

    const botao = adminPage.locator('button').filter({ hasText: 'Cadastrar' });
    await expect(botao).toBeEnabled({ timeout: 5000 });
    await botao.click();
    await adminPage.waitForResponse((resp) => resp.url().includes('/api/v1/clientes') && resp.status() === 200, { timeout: 15000 });
    await adminPage.waitForURL(/\/clientes\/\d+/, { timeout: 5000 });
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
