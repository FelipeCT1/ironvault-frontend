import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clientes',
    pathMatch: 'full',
  },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./features/clientes/clientes.routes').then((m) => m.clientesRoutes),
  },
  {
    path: '**',
    redirectTo: 'clientes',
  },
];