# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> CRUD de Clientes >> 10 - Novo cliente completo
- Location: tests\specs\clientes.spec.ts:19:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
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
    - generic [ref=e21]:
      - generic [ref=e23]:
        - generic [ref=e24]: Clientes
        - heading "Novo Cliente" [level=1] [ref=e25]
      - generic [ref=e28]: "cpf: CPF inválido; genero: Gênero é obrigatório"
      - generic [ref=e29]:
        - generic [ref=e30]:
          - heading "Dados Pessoais" [level=3] [ref=e32]
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e35]: Nome
              - textbox "Nome completo" [ref=e36]: Teste Playwright
            - generic [ref=e37]:
              - generic [ref=e38]: Gênero
              - combobox [ref=e39] [cursor=pointer]:
                - option "Selecione" [selected]
                - option "Masculino"
                - option "Feminino"
                - option "Prefiro não informar"
            - generic [ref=e40]:
              - generic [ref=e41]: Data de Nascimento
              - textbox [ref=e42]: 1990-01-01
            - generic [ref=e43]:
              - generic [ref=e44]: CPF
              - textbox "000.000.000-00" [ref=e45]: "12345678901"
            - generic [ref=e46]:
              - generic [ref=e47]: Tipo Telefone
              - combobox [ref=e48] [cursor=pointer]:
                - option "Celular" [selected]
                - option "Fixo"
            - generic [ref=e49]:
              - generic [ref=e50]:
                - generic [ref=e51]: DDD
                - textbox "11" [ref=e52]
              - generic [ref=e53]:
                - generic [ref=e54]: Telefone
                - textbox "912345678" [ref=e55]: "999999999"
        - generic [ref=e56]:
          - heading "Acesso ao Sistema" [level=3] [ref=e58]
          - generic [ref=e60]:
            - generic [ref=e61]:
              - generic [ref=e62]: E-mail
              - textbox "email@exemplo.com" [ref=e63]: teste1777253558796@pw.com
            - generic [ref=e64]:
              - generic [ref=e65]: Senha
              - textbox "Mín. 8 caracteres" [ref=e66]: Teste@123
            - generic [ref=e67]:
              - generic [ref=e68]: Confirmar Senha
              - textbox "Repita a senha" [ref=e69]: Teste@123
        - generic [ref=e71]:
          - heading "Endereços" [level=3] [ref=e72]
          - button "+ Endereço" [ref=e73] [cursor=pointer]
        - generic [ref=e75]:
          - heading "Cartões de Crédito" [level=3] [ref=e76]
          - button "+ Cartão" [ref=e77] [cursor=pointer]
        - generic [ref=e78]:
          - link "Cancelar" [ref=e79] [cursor=pointer]:
            - /url: /clientes
          - button "Cadastrar" [ref=e80] [cursor=pointer]
  - contentinfo [ref=e82]:
    - generic [ref=e83]: IRONVAULT
    - generic [ref=e84]: © 2026 IRONVAULT · Suplementos de Alta Performance
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
> 31 |     await adminPage.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });
     |                     ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
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
  48 |     await adminPage.locator('.modal-footer button').filter({ hasText: 'Confirmar' }).click();
  49 |     await adminPage.waitForTimeout(500);
  50 |   });
  51 | });
  52 | 
```