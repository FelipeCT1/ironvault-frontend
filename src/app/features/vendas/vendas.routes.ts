import { Routes } from '@angular/router';

export const vendasRoutes: Routes = [
  {
    path: 'carrinho',
    loadComponent: () =>
      import('./carrinho/carrinho').then((m) => m.CarrinhoComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'pedido/:id',
    loadComponent: () =>
      import('./pedido-confirmado/pedido-confirmado').then((m) => m.PedidoConfirmadoComponent),
  },
];
