import { Routes } from '@angular/router';

export const produtosRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lista-produtos/lista-produtos').then((m) => m.ListaProdutosComponent),
  },
];
