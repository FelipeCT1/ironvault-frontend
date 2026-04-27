# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Carrinho e Checkout >> 13 - Carrinho exibe itens adicionados
- Location: tests\specs\checkout.spec.ts:13:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.card')
Expected: 2
Received: 3
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.card')
    8 × locator resolved to 3 elements
      - unexpected value "3"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]: IRONVAULT · Suplementos de Alta Performance · Frete grátis acima de R$199
  - navigation [ref=e6]:
    - link "IRONVAULT" [ref=e7] [cursor=pointer]:
      - /url: /produtos
    - generic [ref=e8]:
      - link "🏪 Loja" [ref=e9] [cursor=pointer]:
        - /url: /produtos
      - link "📦 Pedidos" [ref=e10] [cursor=pointer]:
        - /url: /pedidos
      - link "🔄 Trocas" [ref=e11] [cursor=pointer]:
        - /url: /trocas
      - link "🤖 IA" [ref=e12] [cursor=pointer]:
        - /url: /ia
    - generic [ref=e13]:
      - link "🛒 2" [ref=e14] [cursor=pointer]:
        - /url: /carrinho
        - text: 🛒
        - generic [ref=e15]: "2"
      - generic [ref=e16]: João Silva
      - button "Sair" [ref=e17] [cursor=pointer]
  - main [ref=e18]:
    - generic [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: Vendas
          - heading "Carrinho" [level=1] [ref=e24]
        - button "Limpar Carrinho" [ref=e25] [cursor=pointer]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: 💊
            - generic [ref=e30]:
              - strong [ref=e31]: Whey Protein Concentrate
              - paragraph [ref=e32]: Growth
            - generic [ref=e33]:
              - button "-" [ref=e34] [cursor=pointer]
              - generic [ref=e35]: "1"
              - button "+" [ref=e36] [cursor=pointer]
            - strong [ref=e37]: R$89.90
            - button "Remover" [ref=e38] [cursor=pointer]
          - generic [ref=e39]:
            - generic [ref=e40]: 💊
            - generic [ref=e41]:
              - strong [ref=e42]: Creatina Micronizada
              - paragraph [ref=e43]: Max Titanium
            - generic [ref=e44]:
              - button "-" [ref=e45] [cursor=pointer]
              - generic [ref=e46]: "1"
              - button "+" [ref=e47] [cursor=pointer]
            - strong [ref=e48]: R$59.89
            - button "Remover" [ref=e49] [cursor=pointer]
        - generic [ref=e50]:
          - generic [ref=e52]:
            - heading "Resumo do Pedido" [level=3] [ref=e53]
            - generic [ref=e54]:
              - generic [ref=e55]: Subtotal
              - generic [ref=e56]: R$149.79
            - generic [ref=e57]:
              - strong [ref=e58]: Total
              - strong [ref=e59]: R$149.79
          - link "Continuar para Checkout" [ref=e60] [cursor=pointer]:
            - /url: /checkout
  - contentinfo [ref=e62]:
    - generic [ref=e63]: IRONVAULT
    - generic [ref=e64]: © 2026 IRONVAULT · Suplementos de Alta Performance
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import { test } from '../fixtures/auth.fixture';
  3  | 
  4  | test.describe('Carrinho e Checkout', () => {
  5  | 
  6  |   test.beforeEach(async ({ clientePage }) => {
  7  |     await clientePage.goto('/produtos');
  8  |     await clientePage.locator('.btn-primary.btn-sm').first().click();
  9  |     await clientePage.locator('.btn-primary.btn-sm').nth(1).click();
  10 |     await clientePage.waitForTimeout(500);
  11 |   });
  12 | 
  13 |   test('13 - Carrinho exibe itens adicionados', async ({ clientePage }) => {
  14 |     await clientePage.goto('/carrinho');
> 15 |     await expect(clientePage.locator('.card')).toHaveCount(2);
     |                                                ^ Error: expect(locator).toHaveCount(expected) failed
  16 |     await expect(clientePage.locator('.prod-preco')).toBeVisible();
  17 |   });
  18 | 
  19 |   test('14 - Fluxo checkout completo', async ({ clientePage }) => {
  20 |     await clientePage.goto('/checkout');
  21 |     await clientePage.waitForTimeout(1000);
  22 | 
  23 |     const miniCards = clientePage.locator('.mini-card');
  24 |     const count = await miniCards.count();
  25 | 
  26 |     if (count >= 3) {
  27 |       await miniCards.nth(0).click();
  28 |       await clientePage.waitForTimeout(500);
  29 |       await miniCards.nth(1).click();
  30 |       await clientePage.waitForTimeout(500);
  31 |       await miniCards.nth(2).click();
  32 |       await clientePage.waitForTimeout(500);
  33 |     }
  34 | 
  35 |     const botao = clientePage.locator('.btn-checkout');
  36 |     if (await botao.isEnabled()) {
  37 |       await botao.click();
  38 |       await clientePage.waitForResponse((resp) => resp.url().includes('/api/v1/vendas') && resp.status() === 200);
  39 |       await expect(clientePage).toHaveURL(/\/pedido\/\d+/);
  40 |     }
  41 |   });
  42 | 
  43 |   test('15 - Pedido confirmado exibe dados', async ({ clientePage }) => {
  44 |     await clientePage.goto('/pedidos');
  45 |     await clientePage.waitForTimeout(500);
  46 |     const primeiraLinha = clientePage.locator('table tbody tr').first();
  47 |     if (await primeiraLinha.isVisible()) {
  48 |       const href = await primeiraLinha.locator('a').getAttribute('href');
  49 |       if (href) {
  50 |         await clientePage.goto(href);
  51 |         await expect(clientePage.locator('.card-titulo')).toBeVisible();
  52 |       }
  53 |     }
  54 |   });
  55 | });
  56 | 
```