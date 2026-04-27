import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Trocas', () => {

  test('24 - Página de solicitar troca carrega', async ({ clientePage }) => {
    await clientePage.goto('/trocas/nova');
    await expect(clientePage.locator('h1')).toContainText('Solicitar Troca');
  });

  test('25 - Lista de trocas carrega', async ({ clientePage }) => {
    await clientePage.goto('/trocas');
    await expect(clientePage.locator('h1')).toContainText('Minhas Trocas');
  });
});
