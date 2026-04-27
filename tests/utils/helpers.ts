import { expect } from '@playwright/test';

export async function login(page: import('@playwright/test').Page, email: string, senha: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="senha"]', senha);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/produtos');
}

export function findCard(page: import('@playwright/test').Page, nome: string) {
  return page.locator('.prod-nome', { hasText: nome }).locator('..');
}
