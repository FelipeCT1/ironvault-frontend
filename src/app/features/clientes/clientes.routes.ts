import { Routes } from '@angular/router';

export const clientesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lista-clientes/lista-clientes').then((m) => m.ListaClientesComponent),
  },
  {
    path: 'novo',
    loadComponent: () =>
      import('./form-cliente/form-cliente').then((m) => m.FormClienteComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./form-cliente/form-cliente').then((m) => m.FormClienteComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalhe-cliente/detalhe-cliente').then((m) => m.DetalheClienteComponent),
  },
];