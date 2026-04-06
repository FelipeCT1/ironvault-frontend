import { Injectable } from '@angular/core';
import { Venda, FinalizarCompraDTO, StatusVenda } from '../models/venda.model';
import { of, Observable, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VendaService {
  private contadorPedidos = 1;

  finalizarCompra(dto: FinalizarCompraDTO): Observable<Venda> {
    // Mock de criação de venda
    const venda: Venda = {
      id: this.contadorPedidos,
      clienteId: dto.clienteId,
      codigoPedido: `PED-${String(this.contadorPedidos).padStart(4, '0')}`,
      itens: [], // Será preenchido pelo componente
      enderecoEntrega: dto.enderecoEntrega,
      frete: dto.frete,
      pagamentosCartao: dto.pagamentosCartao,
      cupomPromocional: null,
      cuponsTroca: [],
      subtotal: 0,
      descontoPromocional: 0,
      descontoTroca: 0,
      valorFrete: dto.frete.valor,
      total: 0,
      status: 'EM_PROCESSAMENTO' as StatusVenda,
      dataCriacao: new Date().toISOString(),
    };

    this.contadorPedidos++;

    return of(venda).pipe(delay(1000)); // Simula processamento
  }

  consultarPorId(id: number): Observable<Venda | null> {
    // Mock - em produção buscaria do backend
    return of(null).pipe(delay(100));
  }
}
