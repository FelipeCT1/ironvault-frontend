import { Injectable } from '@angular/core';
import { OpcaoFrete, ItemCarrinho } from '../models/carrinho.model';
import { of, Observable, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FreteService {
  calcularOpcoes(cep: string, itens: ItemCarrinho[]): Observable<OpcaoFrete[]> {
    // Mock de cálculo de frete baseado no peso total
    const pesoTotal = itens.reduce(
      (acc, item) => acc + item.produto.peso * item.quantidade,
      0
    );

    // Base de cálculo mockada
    const cepNum = parseInt(cep.replace(/\D/g, ''), 10);
    const fatorDistancia = (cepNum % 100) / 100 + 0.5; // 0.5 a 1.5

    const opcoes: OpcaoFrete[] = [
      {
        id: 'PAC',
        nome: 'PAC',
        prazoDias: 10,
        valor: Math.round((15 + pesoTotal * 3) * fatorDistancia * 100) / 100,
      },
      {
        id: 'SEDEX',
        nome: 'SEDEX',
        prazoDias: 5,
        valor: Math.round((25 + pesoTotal * 5) * fatorDistancia * 100) / 100,
      },
      {
        id: 'EXPRESSO',
        nome: 'Expresso',
        prazoDias: 2,
        valor: Math.round((45 + pesoTotal * 8) * fatorDistancia * 100) / 100,
      },
    ];

    return of(opcoes).pipe(delay(300));
  }

  calcular(cep: string, itens: ItemCarrinho[]): Observable<OpcaoFrete[]> {
    return this.calcularOpcoes(cep, itens);
  }
}
