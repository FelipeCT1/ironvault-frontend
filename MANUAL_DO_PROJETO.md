# IronVault — Manual do Projeto

**E-commerce de Suplementos para Academia**
**LES — Laboratório de Engenharia de Software — 1º Semestre 2026 — Fatec**

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Como Executar](#5-como-executar)
6. [Funcionalidades Implementadas](#6-funcionalidades-implementadas)
7. [Fluxos da Aplicação](#7-fluxos-da-aplicação)
8. [Autenticação e Autorização](#8-autenticação-e-autorização)
9. [Gerenciamento de Estado no Frontend](#9-gerenciamento-de-estado-no-frontend)
10. [Design System e Prototipação](#10-design-system-e-prototipação)
11. [Testes Automatizados](#11-testes-automatizados)
12. [Decisões Técnicas](#12-decisões-técnicas)
13. [Requisitos Pendentes](#13-requisitos-pendentes)
14. [Repositório Git](#14-repositório-git)

---

## 1. Visão Geral

IronVault é um sistema e-commerce completo para venda de suplementos alimentares (whey protein, creatina, pré-treino, BCAA, vitaminas, etc.). O sistema contempla todo o ciclo de vida de uma loja virtual: catálogo de produtos, cadastro de clientes, carrinho de compras, checkout com múltiplas formas de pagamento, acompanhamento de pedidos, solicitação de trocas e painel administrativo.

O projeto foi desenvolvido como requisito parcial da disciplina **Laboratório de Engenharia de Software (LES)** no 1º semestre de 2026, seguindo um Documento de Requisitos de Software (DRS) com requisitos funcionais (RF), regras de negócio (RN) e requisitos não-funcionais (RNF).

### Funcionalidades Principais

- Catálogo de produtos com filtros por nome, marca e categoria
- CRUD completo de clientes com endereços e cartões de crédito
- Carrinho de compras com persistência local (localStorage)
- Checkout multi-etapas: endereço → frete → pagamento
- Pagamento com múltiplos cartões de crédito, cupons promocionais e de troca
- Acompanhamento de pedidos com timeline de status
- Solicitação e gestão de trocas
- Painel administrativo (dashboard, gerenciamento de pedidos e trocas)
- Autenticação via sessão HTTP (não JWT)

---

## 2. Stack Tecnológica

### Backend — Spring Boot (Java 21)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Java | 21 | Linguagem de programação |
| Spring Boot | 4.0.3 | Framework de aplicação |
| Spring Web MVC | via starter | API REST |
| Spring Data JPA | via starter | Persistência com ORM |
| Spring Security | via starter | Autenticação e autorização |
| Hibernate Validator | 9.1.0 | Validação de dados de entrada |
| Lombok | latest | Redução de boilerplate |
| H2 Database | in-memory | Banco de dados de desenvolvimento |
| PostgreSQL | driver | Banco de dados de produção (configurável) |
| Maven | build tool | Gerenciamento de dependências |
| BCrypt | via Spring Security | Criptografia de senhas |

### Frontend — Angular 21 (Standalone)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Angular | 21.2.10 | Framework SPA |
| TypeScript | 5.9 | Linguagem tipada |
| RxJS | 7.8 | Programação reativa |
| Angular Signals | nativo | Gerenciamento de estado reativo |
| Angular Router | nativo | Roteamento com lazy loading |
| Angular Reactive Forms | nativo | Formulários reativos com validação |
| Angular Animations | nativo | Animações de transição |
| Vitest | 4.0 | Test runner unitário |
| jsdom | 27.1 | Ambiente de teste DOM |
| Playwright | 1.53 | Testes end-to-end |
| Prettier | — | Formatação de código |
| Google Fonts | Barlow + Barlow Condensed | Tipografia |
| CSS Custom Properties | — | Tema escuro (13 variáveis) |

---

## 3. Arquitetura do Sistema

### Diagrama de Comunicação

```
┌─────────────────────┐         ┌──────────────────────┐
│   Angular 21 SPA     │  HTTP   │   Spring Boot API     │
│   (localhost:4200)   │◄───────►│   (localhost:8080)    │
│                      │  JSON   │                       │
│  ┌─────────────────┐ │         │  ┌─────────────────┐  │
│  │ Signals (state) │ │ Cookies │  │ Controllers     │  │
│  │ localStorage    │ │ Sessão  │  │ Services        │  │
│  │ RxJS (HTTP)     │ │         │  │ Repositories    │  │
│  └─────────────────┘ │         │  └─────────────────┘  │
└─────────────────────┘         └──────────────────────┘
```

### Camadas do Backend

O backend segue a arquitetura em camadas:

```
Controller → Service → Repository → Entity (JPA)
    │           │
    ▼           ▼
  DTOs      Regras de Negócio (RN)
```

**Domínios:**
- **Cliente** — entidade principal de usuário com endereços e cartões
- **Produto** — itens do catálogo com categorias e grupos de precificação
- **Cupom** — cupons promocionais e de troca
- **Venda** — pedidos com itens, pagamentos e status
- **Troca** — solicitações de troca com status e crédito

### Camadas do Frontend

O frontend segue o padrão Standalone Components do Angular 21:

```
App Root
  ├── Core (models, services, guards, interceptors)
  ├── Shared (navbar, modal, status-badge, alert, etc.)
  └── Features (lazy-loaded)
       ├── Auth (login)
       ├── Produtos (catálogo)
       ├── Clientes (CRUD)
       ├── Vendas (carrinho, checkout, confirmação)
       ├── Pedidos (lista, detalhe)
       ├── Trocas (lista, solicitar)
       └── Admin (dashboard, gerenciar pedidos/trocas)
```

### Comunicação Frontend ↔ Backend

- **Desenvolvimento:** Proxy do Angular dev server redireciona `/api` → `localhost:8080`
- **Autenticação:** Cookies de sessão HTTP (`JSESSIONID`)
- **Segurança:** `withCredentials: true` em todas as requisições
- **Erro:** Interceptor global captura e padroniza mensagens de erro

---

## 4. Estrutura de Diretórios

```
E-Commerce Esteroides/
├── ecommerce/                          # Backend Spring Boot
│   ├── pom.xml
│   └── src/main/java/dev/fatec/ecommerce/
│       ├── EcommerceApplication.java
│       ├── cliente/                    # Domínio Cliente + Auth
│       │   ├── AuthController.java
│       │   ├── ClienteController.java
│       │   ├── model/  (Cliente, Endereco, CartaoCredito, DTOs)
│       │   ├── repository/
│       │   └── service/  (AuthService, ClienteService)
│       ├── config/                     # CORS, Security, DataInitializer
│       ├── cupom/                      # Domínio Cupom
│       ├── produto/                    # Domínio Produto + Categoria
│       └── venda/                      # Domínio Venda + Troca
│
├── ironvault-frontend/                 # Frontend Angular 21
│   ├── package.json
│   ├── angular.json
│   ├── proxy.conf.json                 # Proxy /api → :8080
│   ├── tests/
│   │   ├── playwright.config.ts
│   │   ├── fixtures/                   # Login compartilhado
│   │   ├── specs/                      # 7 specs, 23 testes
│   │   └── utils/
│   └── src/
│       ├── styles.scss                 # Design system (1300+ linhas)
│       └── app/
│           ├── core/
│           │   ├── guards/    (auth.guard.ts)
│           │   ├── interceptors/ (error-interceptor.ts)
│           │   ├── models/    (5 interfaces TypeScript)
│           │   └── services/  (8 services)
│           ├── features/      # 8 módulos lazy-loaded
│           └── shared/        # Componentes reutilizáveis + validators
│
├── ironvault-prototipo.html           # Protótipo HTML de referência
├── HANDBOOK_HANDOFF.md                # Documentação técnica detalhada
├── MANUAL_DO_PROJETO.md               # Este manual
└── Requisitos e documentos/
    ├── DRS_LES_1_2026 (1).docx        # Documento de Requisitos
    └── ESTIMATIVA (1).xlsx            # Planilha de Estimativas
```

---

## 5. Como Executar

### Pré-requisitos

- **Node.js** 24+ (com npm 11+)
- **Java** 21 (JDK)
- **Maven** (wrapper incluído via `mvnw`)

### Passo 1 — Iniciar o Backend

```bash
cd ecommerce/
./mvnw spring-boot:run
```

- O servidor inicia em `http://localhost:8080`
- Banco H2 em memória com dados de seed (produtos, cupons, usuários)
- Console H2 disponível em `http://localhost:8080/h2-console`

### Passo 2 — Iniciar o Frontend

```bash
cd ironvault-frontend/
npm install
npm start
```

- O servidor inicia em `http://localhost:4200`
- O proxy redireciona `/api/*` para o backend automaticamente

### Contas de Teste

| Perfil | Email | Senha |
|---|---|---|
| Administrador | admin@ironvault.com | admin123 |
| Cliente | joao.silva@email.com | 123456 |

### Seed Data (DataInitializer)

- **8 produtos** — Whey, Creatina, Pré-Treino, BCAA, Glutamina, Multivitamínico, Ômega 3, Shaker
- **3 categorias** — Suplemento, Acessório, Medicamento Controlado
- **3 grupos de precificação** — Standard (30%), Premium (50%), Promocional (15%)
- **5 cupons** — PRIMEIRA10, SUPER20 (promocionais) + TROCA25/50/15 (troca)
- **2 usuários** com endereços e cartões pré-cadastrados

### Executar Testes End-to-End

```bash
cd ironvault-frontend/

# Backend precisa estar rodando em localhost:8080
npm run test:e2e
```

Os testes E2E usam Playwright e executam 23 casos cobrindo login, produtos, clientes, checkout, pedidos, trocas e admin.

---

## 6. Funcionalidades Implementadas

### 6.1 Catálogo de Produtos (acesso público)

**Rota:** `/produtos`

- Grid de 4 colunas com cards de produtos
- Filtros: busca textual (nome/marca) + dropdown de categoria
- Estados: loading (spinner), empty ("nenhum produto"), error (alerta)
- Botão "Adicionar" com verificação de estoque
- Badge do carrinho atualiza em tempo real via Signals

**RF cobertos:** RF0015 (Consulta de produtos)
**Backend:** GET `/api/v1/produtos`, GET `/api/v1/produtos/busca?nome=&categoriaId=`

### 6.2 Cadastro e Gestão de Clientes (acesso admin)

**Rotas:** `/clientes`, `/clientes/novo`, `/clientes/:id`, `/clientes/:id/editar`

**Lista de Clientes:**
- Tabela com código, avatar (iniciais), nome, CPF, email, telefone, status
- Filtros: nome, CPF, email + toggle Todos/Ativos/Inativos
- Ações: Ver (detalhe), Editar, Inativar/Ativar (com modal de confirmação)

**Formulário de Cliente (4 seções):**
1. **Dados Pessoais** — nome, gênero, data de nascimento, CPF, telefone
2. **Acesso ao Sistema** — email, senha, confirmação (validação: 8+ chars, maiúscula, minúscula, especial, senhas iguais)
3. **Endereços** — FormArray dinâmico; mínimo 1 entrega + 1 cobrança (RN validada no backend)
4. **Cartões de Crédito** — FormArray dinâmico; número, nome, bandeira, CVV, preferencial

**Detalhe do Cliente (4 abas):**
- Dados pessoais (read-only)
- Endereços cadastrados
- Cartões de crédito
- Alterar senha (formulário dedicado)

**RF cobertos:** RF0021–RF0024, RF0026–RF0028
**Backend:** CRUD completo em `/api/v1/clientes`, PATCH `/inativar`, PATCH `/ativar`, PATCH `/alterar-senha`
**RN cobertas:** RN0031 (senha forte), RN0032 (confirmação), RN0033 (BCrypt), RN0021 (endereço cobrança), RN0022 (endereço entrega)

### 6.3 Carrinho de Compras (acesso cliente)

**Rota:** `/carrinho`

- Lista de itens com controle de quantidade (+/-), subtotal, botão remover
- Sidebar com resumo de pedido (OrderSummaryComponent)
- Persistência em localStorage (sobrevive a recarregamentos)
- Validação de estoque ao adicionar/alterar quantidades

**RF cobertos:** RF0031 (Gerenciar carrinho), RF0032 (Definir quantidade)
**Backend:** Carrinho é apenas frontend + localStorage; validação de estoque ocorre na finalização

### 6.4 Checkout (acesso cliente)

**Rota:** `/checkout`

**Fluxo em 3 etapas (stepper visual):**

1. **Endereço de Entrega** — selecionar endereço salvo (radio) ou cadastrar novo
2. **Frete** — 3 opções simuladas (PAC, SEDEX, Expresso) com prazo e valor calculados por peso e CEP
3. **Pagamento:**
   - Cupom promocional (validar código via API, fallback mock)
   - Cupons de troca (selecionar múltiplos disponíveis)
   - Cartões de crédito (selecionar cartão, definir valor, mínimo R$10/cartão)
   - Validação: soma dos pagamentos deve bater com total

**Regras de negócio aplicadas no checkout:**
- RN0033 — Apenas 1 cupom promocional por compra
- RN0034 — Mínimo R$10 por cartão de crédito
- RN0035 — Cupons primeiro, depois cartão (pagamento misto)

**RF cobertos:** RF0033–RF0037

### 6.5 Pedidos (acesso cliente)

**Rota:** `/pedidos`

**Lista de Pedidos:**
- Stat-cards com contagem por status (Entregues, Processando, Em Trânsito, Em Troca)
- Tabela com código, data, itens, total, status (badge colorido)
- Clique na linha → detalhe do pedido

**Detalhe do Pedido:**
- Timeline visual com dots coloridos e linha vertical conectando os status
- Lista de itens com nome, quantidade, preço unitário e subtotal
- Informações de entrega (endereço + frete)
- Resumo financeiro (subtotal, descontos, frete, total)
- Botão "Solicitar Troca" para pedidos com status ENTREGUE

**RF cobertos:** RF0038, RF0039
**Backend:** GET `/api/v1/vendas/cliente/{clienteId}`, GET `/api/v1/vendas/{id}`

### 6.6 Trocas (acesso cliente)

**Rotas:** `/trocas`, `/trocas/nova`

**Solicitar Troca:**
- Selecionar pedido ENTREGUE (validação RN0043)
- Selecionar produto do pedido
- Informar quantidade, valor de crédito, motivo
- Submissão gera troca com status SOLICITADA

**Lista de Trocas:**
- Tabela com protocolo, produto, quantidade, valor crédito, status, data

**RF cobertos:** RF0040

### 6.7 Painel Administrativo (acesso admin)

**Rotas:** `/admin`, `/admin/pedidos`, `/admin/trocas`

**Dashboard:**
- 4 stat-cards: Vendas Hoje, Pedidos Ativos, Clientes Ativos, Trocas Pendentes
- Tabela de pedidos recentes
- Links rápidos para gerenciar pedidos e trocas

**Gerenciar Pedidos:**
- Tabela com todos os pedidos e ações por status:
  - EM_PROCESSAMENTO → Aprovar (APROVADA) / Reprovar (REPROVADA + restock)
  - APROVADA → Despachar (EM_TRANSITO)
  - EM_TRANSITO → Confirmar Entrega (ENTREGUE)

**Gerenciar Trocas:**
- Tabela com todas as trocas e ações por status:
  - SOLICITADA → Autorizar (gera cupom de troca) / Recusar
  - AUTORIZADA → Confirmar Recebimento (CONCLUIDA)

**RF cobertos:** RF0038, RF0039, RF0041–RF0044
**RN cobertas:** RN0028, RN0038–RN0042

---

## 7. Fluxos da Aplicação

### Fluxo de Autenticação

```
Usuário acessa /login
  → Preenche email + senha
  → POST /api/v1/auth/login (com withCredentials)
  → Backend valida BCrypt, cria HttpSession
  → Frontend salva em signal _clienteAtual + sessionStorage
  → Redireciona /produtos
  → Navbar atualiza com nome e links conforme papel
```

O `AuthService` persiste o estado do login em `sessionStorage` para que os guards de rota funcionem síncronamente (sem esperar chamada HTTP assíncrona). O `verificarSessao()` é chamado no `ngOnInit` do AppComponent para restaurar sessões existentes.

### Fluxo de Compra Completo

```
1. Produtos → Adicionar ao Carrinho
   → CarrinhoService (Signal) atualiza state + localStorage

2. Carrinho → Checkout
   → authGuard verifica sessão

3. Checkout:
   a. Selecionar Endereço → GET /api/v1/auth/enderecos
   b. Selecionar Frete → FreteService.calcularOpcoes() (mock)
   c. Pagamento:
      - Validar Cupom → GET /api/v1/cupons/validar/{codigo}
      - Selecionar Cartões → GET /api/v1/auth/cartoes
      - Definir valores por cartão

4. Finalizar Compra → POST /api/v1/vendas
   → Backend valida estoque, aplica cupons, calcula totais
   → Retorna Venda com status EM_PROCESSAMENTO

5. Redireciona → /pedido/:id (PedidoConfirmado)

6. Admin: /admin/pedidos
   → Aprovar → APROVADA → Despachar → EM_TRANSITO → Confirmar Entrega → ENTREGUE
```

### Fluxo de Troca

```
1. Cliente acessa /trocas/nova
2. Seleciona pedido ENTREGUE (RN0043)
3. Seleciona produto do pedido
4. Preenche quantidade, motivo, valor de crédito
5. POST /api/v1/trocas → Status: SOLICITADA

6. Admin acessa /admin/trocas
7. Autorizar → PATCH /api/v1/trocas/{id}/autorizar
   → Gera cupom de troca (RN0036)
   → Status: AUTORIZADA

8. Confirmar Recebimento → PATCH /api/v1/trocas/{id}/concluir
   → Status: CONCLUIDA
```

---

## 8. Autenticação e Autorização

### Modelo de Sessão HTTP

Diferentemente da maioria dos projetos modernos que usam JWT, o IronVault utiliza **sessão HTTP nativa** (`HttpSession`):

- O Spring Security armazena `clienteId` e `clientePapel` como atributos da sessão
- O frontend envia `withCredentials: true` em todas as requisições (via ErrorInterceptor)
- O cookie `JSESSIONID` é gerenciado automaticamente pelo navegador
- O CORS está configurado com `allowCredentials(true)` para `localhost:4200`

**Vantagens da abordagem:**
- Não há token para gerenciar no frontend
- Logout invalida a sessão no servidor
- Timeout de sessão gerenciado pelo servidor (30 minutos)

### Guards de Rota

| Guard | Função | Redireciona para |
|---|---|---|
| `authGuard` | Bloqueia rotas para usuários não logados | `/login` |
| `adminGuard` | Bloqueia rotas para não-administradores | `/produtos` (se logado) ou `/login` |

### Persistência de Sessão no Frontend

Para resolver o problema de race condition entre o guard síncrono e a verificação assíncrona de sessão, o `AuthService` salva o estado do login em `sessionStorage`. Ao recarregar a página, o construtor restaura o estado imediatamente, permitindo que os guards tomem decisões sem esperar pela chamada HTTP `verificarSessao()`.

---

## 9. Gerenciamento de Estado no Frontend

O frontend adota **Angular Signals** como mecanismo principal de gerenciamento de estado, sem bibliotecas externas (NgRx, Akita, etc.).

### Estado Global (Services com providedIn: 'root')

| Serviço | Signal/Computed | Descrição |
|---|---|---|
| `AuthService` | `_clienteAtual` | Cliente logado (LoginResponse ou null) |
| | `logado`, `ehAdmin`, `papel`, `nomeCliente` | Computeds derivados |
| `CarrinhoService` | `_state` | Estado completo do carrinho (itens, endereço, frete, cupons) |
| | `itens`, `quantidadeItens`, `temItens` | Computeds para UI |
| | `totais` | Computed: subtotal, descontos, frete, total, totalAPagar |

### Estado Local (por Componente)

Cada componente gerencia seu próprio estado via `signal()`:

- `produtos: Signal<Produto[]>` — lista de dados da API
- `carregando: Signal<boolean>` — controle de loading state
- `erro: Signal<string>` — mensagem de erro

### Persistência

- **Carrinho:** `localStorage` (chave `ironvault_carrinho`) — sobrevive a recarregamentos
- **Sessão:** `sessionStorage` (chave `ironvault_session`) — restaurada no construtor do AuthService
- **Limpeza:** Carrinho limpo ao finalizar compra; sessão limpa ao fazer logout

---

## 10. Design System e Prototipação

### Protótipo de Referência

O design visual do IronVault foi baseado no protótipo HTML estático (`ironvault-prototipo.html`, 1119 linhas). Esse protótipo serviu como guia de layout para todas as páginas, definindo:

- Paleta de cores (tema escuro com acento verde-limão `#e8ff00`)
- Tipografia (Barlow para corpo, Barlow Condensed para títulos)
- Componentes (cards, tabelas, badges, modais, drawers, formulários)
- Layouts de página (grid, steps, tabs, search bar)

### Variáveis CSS (Design Tokens)

```css
:root {
  --preto: #0f0f0f;     /* fundo principal */
  --escuro: #1a1a1a;    /* cards, nav */
  --painel: #242424;    /* inputs, painéis */
  --borda: #333;        /* bordas */
  --mudo: #777;         /* texto secundário */
  --claro: #ccc;        /* texto principal */
  --branco: #f0f0f0;    /* títulos */
  --acento: #e8ff00;    /* cor de destaque (verde-limão) */
  --verde: #22c55e;     /* sucesso */
  --azul: #3b82f6;      /* informação */
  --laranja: #ff4d00;   /* alerta/erro */
  --roxo: #a855f7;      /* troca */
}
```

### Componentes Compartilhados (8)

| Componente | Seletor | Função |
|---|---|---|
| NavbarComponent | `app-navbar` | Barra de navegação superior |
| ModalComponent | `app-modal` | Overlay modal |
| OrderSummaryComponent | `app-order-summary` | Resumo de totais (sidebar) |
| StatusBadgeComponent | `app-status-badge` | Badge colorido de status |
| AlertComponent | `app-alert` | Banner de alerta (info/success/warn/danger) |
| LoadingComponent | `app-loading` | Spinner com mensagem |
| EmptyStateComponent | `app-empty-state` | Estado vazio com slot de ação |
| PageHeaderComponent | `app-page-header` | Cabeçalho de página com rótulo |
| TopbarComponent | `app-topbar` | Barra promocional superior |
| FooterComponent | `app-footer` | Rodapé |

---

## 11. Testes Automatizados

### Testes Unitários

- **Framework:** Vitest + jsdom (alternativa mais rápida ao Karma/Jasmine tradicional)
- **Configuração:** `vitest.config.ts` com `environment: 'jsdom'`
- **Cobertura atual:** Teste de criação (boilerplate do Angular CLI)

### Testes End-to-End (Playwright)

**Total: 23 testes em 7 specs**

| Spec | Testes | Descrição |
|---|---|---|
| `login.spec.ts` | 3 | Login admin, login cliente, login inválido |
| `produtos.spec.ts` | 4 | Listagem, filtro nome, filtro categoria, adicionar carrinho |
| `clientes.spec.ts` | 5 | Lista, busca, novo cliente completo, abas, inativar |
| `checkout.spec.ts` | 3 | Carrinho, checkout completo, pedido confirmado |
| `pedidos.spec.ts` | 2 | Lista com stat-cards, detalhe com timeline |
| `trocas.spec.ts` | 2 | Solicitar troca, lista de trocas |
| `admin.spec.ts` | 4 | Dashboard, gerenciar pedidos, ações, gerenciar trocas |

**Execução:** `npm run test:e2e` (backup automático do web server)

---

## 12. Decisões Técnicas

### 12.1 Angular Signals ao invés de NgRx/Redux

**Motivo:** O projeto é de escala moderada e não justifica a complexidade de um store global como NgRx. Signals são nativos do Angular 17+, oferecem reatividade granular com `computed()` e integram-se naturalmente com `ChangeDetectionStrategy.OnPush`.

### 12.2 Sessão HTTP ao invés de JWT

**Motivo:** Determinado pelo escopo do projeto acadêmico e pela stack do backend (Spring Boot com `HttpSession`). Evita a complexidade de refresh tokens, blacklisting e renovação automática.

### 12.3 Standalone Components ao invés de NgModules

**Motivo:** Angular 17+ recomenda standalone components como padrão. Elimina a necessidade de declarar módulos para cada feature, reduz boilerplate e facilita o lazy loading.

### 12.4 `@angular/build` (Vite) ao invés de Webpack

**Motivo:** Angular 21 usa o novo build system baseado em esbuild/Vite. Builds mais rápidas e dev server com HMR instantâneo. O proxy usa o formato Vite (`/api` sem wildcard).

### 12.5 Playwright ao invés de Cypress

**Motivo:** Playwright é mais moderno, suporta múltiplos navegadores, é mais rápido, e oferece melhor integração com CI/CD. Suporte nativo a fixtures, auto-wait, e screenshots automáticos em falhas.

### 12.6 Simulação de Frete (Mock)

**Motivo:** Não há integração com API de frete real (Correios, etc.). O `FreteService` simula 3 opções com delay de 300ms baseado no peso total e distância do CEP. Pode ser substituído por API real futuramente.

### 12.7 Vitest ao invés de Karma/Jasmine

**Motivo:** Vitest é significativamente mais rápido, usa a mesma API do Jest (mais familiar), e integra-se com Vite (que é o build system do Angular 21).

---

## 13. Requisitos Pendentes

Baseado no DRS, os seguintes requisitos não foram implementados nesta versão:

| ID | Descrição | Prioridade | Observação |
|---|---|---|---|
| RF0011-16 | CRUD de Produtos (frontend) | Alta | Backend completo; falta tela de cadastro/edição de produtos |
| RF0025 | Transações do cliente | Média | Histórico na página de detalhe do cliente |
| RF0051 | Entrada em estoque | Alta | Backend tem endpoint; falta frontend |
| RF0055 | Análise de vendas com gráfico | Média | Gráfico de linhas (RNF0043) |
| RNF0042 | Bloqueio temporário de itens no carrinho | Alta | RN0044: timeout com notificação |
| RNF0044 | IA Generativa / Chatbot | Alta | Protótipo HTML existe; integração pendente |
| RN0044 | Bloqueio de produtos no carrinho | Alta | Backend parcial |
| RN0027 | Ranking de cliente | Baixa | Algoritmo de ranking por perfil de compra |
| RF0034 (RNF) | Alteração apenas de endereços | Baixa | Endpoint separado para editar endereços |

---

## 14. Repositório Git

**URL:** https://github.com/FelipeCT1/ironvault-frontend

**Branches:**
- `main` — Frontend atual (Angular 21 standalone, funcional e testado)
- `old-frontend` — Código anterior preservado para histórico

**Backend:** mantido localmente em `ecommerce/` (não versionado no repositório frontend)

---

## Glossário

| Sigla | Significado |
|---|---|
| RF | Requisito Funcional |
| RN | Regra de Negócio |
| RNF | Requisito Não-Funcional |
| DRS | Documento de Requisitos de Software |
| DTO | Data Transfer Object |
| SPA | Single Page Application |
| ORM | Object-Relational Mapping |
| BCrypt | Algoritmo de hash de senhas |
| E2E | End-to-End (testes) |
| HMR | Hot Module Replacement |

---

*Manual gerado em 27/04/2026 com base na implementação completa do sistema IronVault.*
