import { test as base } from '@playwright/test';

export const test = base.extend<{
  adminPage: import('@playwright/test').Page;
  clientePage: import('@playwright/test').Page;
}>({
  adminPage: async ({ browser }, use) => {
    const page = await browser.newPage();
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@ironvault.com');
    await page.fill('[name="senha"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/produtos');
    await use(page);
    await page.close();
  },
  clientePage: async ({ browser }, use) => {
    const page = await browser.newPage();
    await page.goto('/login');
    await page.fill('[name="email"]', 'joao.silva@email.com');
    await page.fill('[name="senha"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/produtos');
    await use(page);
    await page.close();
  },
});
