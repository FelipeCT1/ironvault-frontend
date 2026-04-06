import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'produtos',
    pathMatch: 'full',
  },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./features/clientes/clientes.routes').then((m) => m.clientesRoutes),
  },
  {
    path: 'produtos',
    loadChildren: () =>
      import('./features/produtos/produtos.routes').then((m) => m.produtosRoutes),
  },
  {
    path: 'carrinho',
    loadComponent: () =>
      import('./features/vendas/carrinho/carrinho').then((m) => m.CarrinhoComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/vendas/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'pedido/:id',
    loadComponent: () =>
      import('./features/vendas/pedido-confirmado/pedido-confirmado').then((m) => m.PedidoConfirmadoComponent),
  },
  {
    path: '**',
    redirectTo: 'produtos',
  },
];