import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/produtos', pathMatch: 'full' },

  { path: 'ia', redirectTo: '/produtos' },

  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent) },

  { path: 'produtos', loadComponent: () => import('./features/produtos/lista-produtos/lista-produtos').then((m) => m.ListaProdutosComponent) },

  {
    path: 'clientes',
    loadChildren: () => import('./features/clientes/clientes.routes').then((m) => m.clientesRoutes),
  },

  { path: 'carrinho', loadComponent: () => import('./features/vendas/carrinho/carrinho').then((m) => m.CarrinhoComponent), canMatch: [authGuard] },

  { path: 'checkout', loadComponent: () => import('./features/vendas/checkout/checkout').then((m) => m.CheckoutComponent), canMatch: [authGuard] },

  { path: 'pedido/:id', loadComponent: () => import('./features/vendas/pedido-confirmado/pedido-confirmado').then((m) => m.PedidoConfirmadoComponent), canMatch: [authGuard] },

  {
    path: 'pedidos',
    loadChildren: () => import('./features/pedidos/pedidos.routes').then((m) => m.pedidosRoutes),
  },

  {
    path: 'trocas',
    loadChildren: () => import('./features/trocas/trocas.routes').then((m) => m.trocasRoutes),
  },

  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },

  { path: '**', redirectTo: '/produtos' },
];
