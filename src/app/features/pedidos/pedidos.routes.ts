import { Route } from '@angular/router';
import { ListaPedidosComponent } from './lista-pedidos/lista-pedidos';
import { DetalhePedidoComponent } from './detalhe-pedido/detalhe-pedido';
import { authGuard } from '../../core/guards/auth.guard';

export const pedidosRoutes: Route[] = [
  {
    path: '',
    canMatch: [authGuard],
    children: [
      { path: '', component: ListaPedidosComponent },
      { path: ':id', component: DetalhePedidoComponent },
    ],
  },
];
