import { Injectable } from '@angular/core';
import { Cupom } from '../models/carrinho.model';
import { of, Observable, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CupomService {
  private readonly cupons: Cupom[] = [
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
    const cupom = this.cupons.find(
      (c) => c.codigo.toUpperCase() === codigo.toUpperCase()
    );

    if (!cupom) {
      return of(null).pipe(delay(200));
    }

    // Verifica validade
    const hoje = new Date();
    const validoAte = new Date(cupom.validoAte);
    if (validoAte < hoje) {
      return of(null).pipe(delay(200));
    }

    return of(cupom).pipe(delay(200));
  }

  listarCuponsTroca(clienteId: number): Observable<Cupom[]> {
    const cupons = this.cupons.filter(
      (c) => c.tipo === 'TROCA' && c.clienteId === clienteId
    );
    return of(cupons).pipe(delay(150));
  }
}
