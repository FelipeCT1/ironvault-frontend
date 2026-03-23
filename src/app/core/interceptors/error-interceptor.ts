import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err) => {
      const msg =
        err?.error?.message ??
        err?.error?.erro    ??
        err?.message        ??
        'Erro inesperado. Tente novamente.';
      console.error(`[IRONVAULT] ${err.status} — ${msg}`);
      return throwError(() => new Error(msg));
    })
  );
};