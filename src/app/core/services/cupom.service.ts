import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { Cupom } from '../models/carrinho.model';

const CUPONS_MOCK: Cupom[] = [
  { id: 1, codigo: 'PRIMEIRA10', tipo: 'PROMOCIONAL', valor: 10, validoAte: '2027-12-31' },
  { id: 2, codigo: 'SUPER20', tipo: 'PROMOCIONAL', valor: 20, validoAte: '2027-12-31' },
];

@Injectable({ providedIn: 'root' })
export class CupomService {
  constructor(private http: HttpClient) {}

  validarCupom(codigo: string) {
    return this.http
      .get<Cupom>(`/api/v1/cupons/validar/${codigo}`)
      .pipe(catchError(() => of(CUPONS_MOCK.find((c) => c.codigo === codigo) ?? null)));
  }

  listarCuponsTroca(clienteId: number) {
    return this.http.get<Cupom[]>(`/api/v1/cupons/troca/cliente/${clienteId}`).pipe(
      catchError(() => of([])),
    );
  }

  listarPromocionais() {
    return this.http.get<Cupom[]>('/api/v1/cupons/promocionais').pipe(
      catchError(() => of(CUPONS_MOCK)),
    );
  }
}
