import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import type { OpcaoFrete } from '../models/carrinho.model';
import type { ItemCarrinho } from '../models/carrinho.model';

@Injectable({ providedIn: 'root' })
export class FreteService {
  calcularOpcoes(cep: string, itens: ItemCarrinho[]) {
    const pesoTotal = itens.reduce((acc, i) => acc + i.produto.peso * i.quantidade, 0);
    const fatorDistancia = cep ? Math.max(0.5, Math.min(1.5, Math.abs(Number(cep.slice(0, 3)) - 130) / 500)) : 1;
    const base = pesoTotal * fatorDistancia;

    const opcoes: OpcaoFrete[] = [
      { id: 'pac', nome: 'PAC', prazoDias: 10, valor: Math.round(Math.max(15, base * 2 + 10)) },
      { id: 'sedex', nome: 'SEDEX', prazoDias: 5, valor: Math.round(Math.max(25, base * 3 + 15)) },
      { id: 'expresso', nome: 'Expresso', prazoDias: 2, valor: Math.round(Math.max(40, base * 5 + 20)) },
    ];

    return of(opcoes).pipe(delay(300));
  }
}
