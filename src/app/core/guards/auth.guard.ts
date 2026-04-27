import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.logado()) {
    return true;
  }

  return router.parseUrl('/login');
};

export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.ehAdmin()) {
    return true;
  }

  if (auth.logado()) {
    return router.parseUrl('/produtos');
  }

  return router.parseUrl('/login');
};
