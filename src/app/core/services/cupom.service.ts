import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cupom } from '../models/carrinho.model';
import { Observable, of, delay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CupomService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/cupons';

  // Fallback para mocks caso backend não esteja disponível
  private readonly mockCupons: Cupom[] = [
    {
      id: 1,
      codigo: 'PRIMEIRA10',
      tipo: 'PROMOCIONAL',
      valor: 10,
      validoAte: '2026-12-31',
    },
    {
      id: 2,
      codigo: 'SUPER20',
      tipo: 'PROMOCIONAL',
      valor: 20,
      validoAte: '2026-06-30',
    },
    {
      id: 3,
      codigo: 'TROCA25',
      tipo: 'TROCA',
      valor: 25,
      validoAte: '2026-12-31',
      clienteId: 1,
    },
    {
      id: 4,
      codigo: 'TROCA50',
      tipo: 'TROCA',
      valor: 50,
      validoAte: '2026-12-31',
      clienteId: 1,
    },
    {
      id: 5,
      codigo: 'TROCA15',
      tipo: 'TROCA',
      valor: 15,
      validoAte: '2026-12-31',
      clienteId: 1,
    },
  ];

  validarCupom(codigo: string): Observable<Cupom | null> {
    return this.http.get<any>(`${this.base}/validar/${codigo}`).pipe(
      map(p => this.mapCupom(p)),
      catchError(() => {
        // Fallback para mock
        const cupom = this.mockCupons.find(
          (c) => c.codigo.toUpperCase() === codigo.toUpperCase()
        );
        return of(cupom || null).pipe(delay(200));
      })
    );
  }

  listarCuponsTroca(clienteId: number): Observable<Cupom[]> {
    return this.http.get<any[]>(`${this.base}/troca/cliente/${clienteId}`).pipe(
      map(data => data.map(p => this.mapCupom(p))),
      catchError(() => {
        // Fallback para mock
        const cupons = this.mockCupons.filter(
          (c) => c.tipo === 'TROCA' && c.clienteId === clienteId
        );
        return of(cupons).pipe(delay(150));
      })
    );
  }

  private mapCupom(p: any): Cupom {
    return {
      id: p.id,
      codigo: p.codigo,
      tipo: p.tipo,
      valor: p.valor,
      validoAte: p.validoAte,
      clienteId: p.clienteId,
    };
  }
}
