# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Carrinho e Checkout >> 14 - Fluxo checkout completo
- Location: tests\specs\checkout.spec.ts:19:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForResponse: Target page, context or browser has been closed
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
      - generic [ref=e22]:
        - generic [ref=e23]: Checkout
        - heading "Finalizar Pedido" [level=1] [ref=e24]
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: "1"
          - generic [ref=e28]: Endereço
        - generic [ref=e30]:
          - generic [ref=e31]: "2"
          - generic [ref=e32]: Frete
        - generic [ref=e34]:
          - generic [ref=e35]: "3"
          - generic [ref=e36]: Pagamento
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - generic [ref=e42]: 1. Endereço de Entrega
            - generic [ref=e43]:
              - generic [ref=e45]:
                - strong [ref=e46]: Casa
                - paragraph [ref=e47]: das Flores, 123
              - generic [ref=e49]:
                - strong [ref=e50]: Trabalho
                - paragraph [ref=e51]: Paulista, 1000
            - button "+ Novo endereço" [ref=e52] [cursor=pointer]
          - generic [ref=e53]:
            - generic [ref=e55]: 2. Frete
            - generic [ref=e56]:
              - generic [ref=e57]:
                - generic [ref=e58]:
                  - strong [ref=e59]: PAC
                  - paragraph [ref=e60]: 10 dias úteis
                - strong [ref=e61]: R$15.00
              - generic [ref=e62]:
                - generic [ref=e63]:
                  - strong [ref=e64]: SEDEX
                  - paragraph [ref=e65]: 5 dias úteis
                - strong [ref=e66]: R$25.00
              - generic [ref=e67]:
                - generic [ref=e68]:
                  - strong [ref=e69]: Expresso
                  - paragraph [ref=e70]: 2 dias úteis
                - strong [ref=e71]: R$40.00
          - generic [ref=e72]:
            - generic [ref=e74]: 3. Pagamento
            - generic [ref=e75]:
              - generic [ref=e76]:
                - text: Cupom Promocional
                - generic [ref=e77]:
                  - textbox "Código do cupom" [ref=e78]
                  - button "Validar" [ref=e79] [cursor=pointer]
              - generic [ref=e80]:
                - text: Cupons de Troca
                - paragraph [ref=e81]: Nenhum cupom de troca disponível.
              - generic [ref=e82]:
                - text: Cartões de Crédito
                - generic [ref=e83]:
                  - generic [ref=e84]:
                    - generic [ref=e86]: Preferencial
                    - generic [ref=e87]:
                      - strong [ref=e88]: VISA
                      - paragraph [ref=e89]: "**** 1234 · JOAO SILVA"
                  - generic [ref=e91]:
                    - strong [ref=e92]: MASTERCARD
                    - paragraph [ref=e93]: "**** 5678 · JOAO SILVA"
                - generic [ref=e95]:
                  - text: Valor a cobrar neste cartão
                  - spinbutton [ref=e96]: "149.79000000000002"
                - button "+ Novo Cartão" [ref=e97] [cursor=pointer]
          - generic [ref=e100]: Total a pagar é 164.79, mas a soma dos cartões é 149.79
        - generic [ref=e101]:
          - generic [ref=e103]:
            - heading "Resumo do Pedido" [level=3] [ref=e104]
            - generic [ref=e105]:
              - generic [ref=e106]: Subtotal
              - generic [ref=e107]: R$149.79
            - generic [ref=e108]:
              - generic [ref=e109]: Frete PAC
              - generic [ref=e110]: R$15.00
            - generic [ref=e111]:
              - strong [ref=e112]: Total
              - strong [ref=e113]: R$164.79
          - button "Finalizar Compra →" [active] [ref=e114] [cursor=pointer]
  - contentinfo [ref=e116]:
    - generic [ref=e117]: IRONVAULT
    - generic [ref=e118]: © 2026 IRONVAULT · Suplementos de Alta Performance
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
  15 |     await expect(clientePage.locator('.card')).toHaveCount(2);
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
> 38 |       await clientePage.waitForResponse((resp) => resp.url().includes('/api/v1/vendas') && resp.status() === 200);
     |                         ^ Error: page.waitForResponse: Target page, context or browser has been closed
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