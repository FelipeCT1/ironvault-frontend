import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { GerenciarPedidosComponent } from './gerenciar-pedidos/gerenciar-pedidos';
import { GerenciarTrocasComponent } from './gerenciar-trocas/gerenciar-trocas';
import { adminGuard } from '../../core/guards/auth.guard';

export const adminRoutes: Route[] = [
  {
    path: '',
    canMatch: [adminGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'pedidos', component: GerenciarPedidosComponent },
      { path: 'trocas', component: GerenciarTrocasComponent },
    ],
  },
];
