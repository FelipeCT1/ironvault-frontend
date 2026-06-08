import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('IA Widget Flutuante', () => {

  test('CT-54 - FAB do assistente IA está visível na página', async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.waitForTimeout(1000);

    const fab = clientePage.locator('.ia-fab');
    await expect(fab).toBeVisible({ timeout: 3000 });
  });

  test('CT-55 - Clicar no FAB abre o popup com tabs', async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.waitForTimeout(1000);

    await clientePage.locator('.ia-fab').click();
    await clientePage.waitForTimeout(500);

    const popup = clientePage.locator('.ia-popup');
    await expect(popup).toBeVisible({ timeout: 3000 });

    const tabs = popup.locator('.ia-tab');
    await expect(tabs).toHaveCount(3, { timeout: 3000 });

    await expect(tabs.nth(0)).toContainText('Chat');
    await expect(tabs.nth(1)).toContainText('Pra Você');
    await expect(tabs.nth(2)).toContainText('Histórico');
  });

  test('CT-56 - Popup tem input de chat e botão enviar', async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.waitForTimeout(1000);

    await clientePage.locator('.ia-fab').click();
    await clientePage.waitForTimeout(500);

    const input = clientePage.locator('.ia-chat-input input');
    await expect(input).toBeVisible({ timeout: 3000 });

    const sendBtn = clientePage.locator('.ia-btn-send');
    await expect(sendBtn).toBeVisible({ timeout: 3000 });
  });

  test('CT-57 - Clicar em FAB novamente fecha o popup', async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.waitForTimeout(1000);

    const fab = clientePage.locator('.ia-fab');
    await fab.click();
    await clientePage.waitForTimeout(500);
    await expect(clientePage.locator('.ia-popup')).toBeVisible({ timeout: 3000 });

    await fab.click();
    await clientePage.waitForTimeout(500);
    await expect(clientePage.locator('.ia-popup')).not.toBeVisible({ timeout: 3000 });
  });

  test('CT-58 - Mensagem inicial do bot é exibida ao abrir', async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.waitForTimeout(1000);

    await clientePage.locator('.ia-fab').click();
    await clientePage.waitForTimeout(800);

    const msgBot = clientePage.locator('.ia-msg.bot');
    await expect(msgBot.first()).toBeVisible({ timeout: 3000 });
    await expect(msgBot.first()).toContainText('IronVault', { timeout: 3000 });
  });

  test('CT-59 - Botão fechar (✕) recolhe o popup', async ({ clientePage }) => {
    await clientePage.goto('/produtos');
    await clientePage.waitForTimeout(1000);

    await clientePage.locator('.ia-fab').click();
    await clientePage.waitForTimeout(500);

    const closeBtn = clientePage.locator('.ia-header-btn');
    await closeBtn.click();
    await clientePage.waitForTimeout(500);

    await expect(clientePage.locator('.ia-popup')).not.toBeVisible({ timeout: 3000 });
  });

  test('CT-60 - FAB está visível também para admin', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForTimeout(1000);

    const fab = adminPage.locator('.ia-fab');
    await expect(fab).toBeVisible({ timeout: 3000 });
  });
});
