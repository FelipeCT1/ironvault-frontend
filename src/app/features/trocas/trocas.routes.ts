import { Route } from '@angular/router';
import { ListaTrocasComponent } from './lista-trocas/lista-trocas';
import { SolicitarTrocaComponent } from './solicitar-troca/solicitar-troca';
import { authGuard } from '../../core/guards/auth.guard';

export const trocasRoutes: Route[] = [
  {
    path: '',
    canMatch: [authGuard],
    children: [
      { path: '', component: ListaTrocasComponent },
      { path: 'nova', component: SolicitarTrocaComponent },
    ],
  },
];
