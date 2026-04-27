import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const clone = req.clone({
    withCredentials: true,
  });

  return next(clone).pipe(
    catchError((err) => {
      let msg = 'Erro inesperado. Tente novamente.';

      if (err.error) {
        msg = err.error.detail || err.error.message || err.error.erro || msg;
      } else if (err.message) {
        msg = err.message;
      }

      return throwError(() => new Error(msg));
    }),
  );
};
