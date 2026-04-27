import { Route } from '@angular/router';
import { ListaClientesComponent } from './lista-clientes/lista-clientes';
import { FormClienteComponent } from './form-cliente/form-cliente';
import { DetalheClienteComponent } from './detalhe-cliente/detalhe-cliente';
import { adminGuard } from '../../core/guards/auth.guard';

export const clientesRoutes: Route[] = [
  {
    path: '',
    canMatch: [adminGuard],
    children: [
      { path: '', component: ListaClientesComponent },
      { path: 'novo', component: FormClienteComponent },
      { path: ':id', component: DetalheClienteComponent },
      { path: ':id/editar', component: FormClienteComponent },
    ],
  },
];
