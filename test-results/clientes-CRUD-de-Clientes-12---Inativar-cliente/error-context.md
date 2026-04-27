# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> CRUD de Clientes >> 12 - Inativar cliente
- Location: tests\specs\clientes.spec.ts:43:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('.modal-footer button').filter({ hasText: 'Confirmar' })

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
      - link "👤 Clientes" [ref=e10] [cursor=pointer]:
        - /url: /clientes
      - link "📦 Pedidos" [ref=e11] [cursor=pointer]:
        - /url: /admin/pedidos
      - link "🔄 Trocas" [ref=e12] [cursor=pointer]:
        - /url: /admin/trocas
      - link "🤖 IA" [ref=e13] [cursor=pointer]:
        - /url: /ia
      - link "⚙️ Admin" [ref=e14] [cursor=pointer]:
        - /url: /admin
    - generic [ref=e15]:
      - link "🛒" [ref=e16] [cursor=pointer]:
        - /url: /carrinho
      - generic [ref=e17]: Admin IronVault
      - button "Sair" [ref=e18] [cursor=pointer]
  - main [ref=e19]:
    - generic [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: Gestão
            - heading "Clientes" [level=1] [ref=e25]
            - paragraph [ref=e26]: Gerencie os clientes cadastrados
          - link "+ Novo Cliente" [ref=e27] [cursor=pointer]:
            - /url: /clientes/novo
        - generic [ref=e28]:
          - textbox "Nome..." [ref=e29]
          - textbox "CPF..." [ref=e30]
          - textbox "E-mail..." [ref=e31]
          - button "Buscar" [ref=e32] [cursor=pointer]
          - button "Limpar" [ref=e33] [cursor=pointer]
          - generic [ref=e34]:
            - button "Todos" [ref=e35] [cursor=pointer]
            - button "Ativos" [ref=e36] [cursor=pointer]
            - button "Inativos" [ref=e37] [cursor=pointer]
        - table [ref=e40]:
          - rowgroup [ref=e41]:
            - row "Código Nome CPF E-mail Telefone Status Ações" [ref=e42]:
              - columnheader "Código" [ref=e43]
              - columnheader "Nome" [ref=e44]
              - columnheader "CPF" [ref=e45]
              - columnheader "E-mail" [ref=e46]
              - columnheader "Telefone" [ref=e47]
              - columnheader "Status" [ref=e48]
              - columnheader "Ações" [ref=e49]
          - rowgroup [ref=e50]:
            - row "#1 AI Admin IronVault 229.873.678-21 admin@ironvault.com (11) 99999-0000 Ativo Ver Editar Inativar" [ref=e51]:
              - cell "#1" [ref=e52]
              - cell "AI Admin IronVault" [ref=e53]:
                - generic [ref=e54]: AI
                - text: Admin IronVault
              - cell "229.873.678-21" [ref=e55]
              - cell "admin@ironvault.com" [ref=e56]
              - cell "(11) 99999-0000" [ref=e57]
              - cell "Ativo" [ref=e58]:
                - generic [ref=e60]: Ativo
              - cell "Ver Editar Inativar" [ref=e61]:
                - link "Ver" [ref=e62] [cursor=pointer]:
                  - /url: /clientes/1
                - link "Editar" [ref=e63] [cursor=pointer]:
                  - /url: /clientes/1/editar
                - button "Inativar" [active] [ref=e64] [cursor=pointer]
            - row "#2 JS João Silva 697.507.430-59 joao.silva@email.com (11) 99999-8888 Ativo Ver Editar Inativar" [ref=e65]:
              - cell "#2" [ref=e66]
              - cell "JS João Silva" [ref=e67]:
                - generic [ref=e68]: JS
                - text: João Silva
              - cell "697.507.430-59" [ref=e69]
              - cell "joao.silva@email.com" [ref=e70]
              - cell "(11) 99999-8888" [ref=e71]
              - cell "Ativo" [ref=e72]:
                - generic [ref=e74]: Ativo
              - cell "Ver Editar Inativar" [ref=e75]:
                - link "Ver" [ref=e76] [cursor=pointer]:
                  - /url: /clientes/2
                - link "Editar" [ref=e77] [cursor=pointer]:
                  - /url: /clientes/2/editar
                - button "Inativar" [ref=e78] [cursor=pointer]
      - generic [ref=e80]:
        - generic [ref=e81]:
          - heading "Confirmação" [level=3] [ref=e82]
          - button "✕" [ref=e83] [cursor=pointer]
        - paragraph [ref=e85]:
          - text: Tem certeza que deseja inativar o cliente
          - strong [ref=e86]: Admin IronVault
          - text: "?"
  - contentinfo [ref=e88]:
    - generic [ref=e89]: IRONVAULT
    - generic [ref=e90]: © 2026 IRONVAULT · Suplementos de Alta Performance
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import { test } from '../fixtures/auth.fixture';
  3  | 
  4  | test.describe('CRUD de Clientes', () => {
  5  | 
  6  |   test('8 - Lista de clientes carrega', async ({ adminPage }) => {
  7  |     await adminPage.goto('/clientes');
  8  |     await expect(adminPage.locator('table tbody tr')).not.toHaveCount(0);
  9  |   });
  10 | 
  11 |   test('9 - Buscar cliente por nome', async ({ adminPage }) => {
  12 |     await adminPage.goto('/clientes');
  13 |     await adminPage.fill('input[placeholder="Nome..."]', 'João');
  14 |     await adminPage.click('button:has-text("Buscar")');
  15 |     await adminPage.waitForTimeout(500);
  16 |     await expect(adminPage.locator('table tbody tr')).not.toHaveCount(0);
  17 |   });
  18 | 
  19 |   test('10 - Novo cliente completo', async ({ adminPage }) => {
  20 |     const email = `teste${Date.now()}@pw.com`;
  21 |     await adminPage.goto('/clientes/novo');
  22 |     await adminPage.fill('input[formcontrolname="nome"]', 'Teste Playwright');
  23 |     await adminPage.fill('input[formcontrolname="cpf"]', '12345678901');
  24 |     await adminPage.fill('input[formcontrolname="dataNascimento"]', '1990-01-01');
  25 |     await adminPage.fill('input[formcontrolname="ddd"]', '11');
  26 |     await adminPage.fill('input[formcontrolname="numeroTelefone"]', '999999999');
  27 |     await adminPage.fill('input[formcontrolname="email"]', email);
  28 |     await adminPage.fill('input[formcontrolname="senha"]', 'Teste@123');
  29 |     await adminPage.fill('input[formcontrolname="confirmacaoSenha"]', 'Teste@123');
  30 |     await adminPage.click('button:has-text("Cadastrar")');
  31 |     await adminPage.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });
  32 |     await expect(adminPage.locator('h1')).toContainText('Teste Playwright');
  33 |   });
  34 | 
  35 |   test('11 - Abas do detalhe funcionam', async ({ adminPage }) => {
  36 |     await adminPage.goto('/clientes');
  37 |     const botaoVer = adminPage.locator('a, button').filter({ hasText: 'Ver' }).first();
  38 |     await botaoVer.click();
  39 |     await adminPage.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });
  40 |     await expect(adminPage.locator('.tab.active')).toContainText('Dados');
  41 |   });
  42 | 
  43 |   test('12 - Inativar cliente', async ({ adminPage }) => {
  44 |     await adminPage.goto('/clientes');
  45 |     await adminPage.locator('button').filter({ hasText: /Inativar/i }).first().click();
  46 |     await adminPage.waitForTimeout(500);
  47 |     await expect(adminPage.locator('.modal-overlay')).toBeVisible();
> 48 |     await adminPage.locator('.modal-footer button').filter({ hasText: 'Confirmar' }).click();
     |                                                                                      ^ Error: locator.click: Target page, context or browser has been closed
  49 |     await adminPage.waitForTimeout(500);
  50 |   });
  51 | });
  52 | 
```