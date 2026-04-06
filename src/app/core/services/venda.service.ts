import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venda, FinalizarCompraDTO, StatusVenda } from '../models/venda.model';
import { of, Observable, delay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VendaService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/vendas';
  private contadorPedidos = 1;

  finalizarCompra(dto: FinalizarCompraDTO): Observable<Venda> {
    return this.http.post<any>(this.base, dto).pipe(
      map(v => this.mapVenda(v)),
      catchError(() => {
        // Fallback para mock
        const venda: Venda = {
          id: this.contadorPedidos,
          clienteId: dto.clienteId,
          codigoPedido: `PED-${String(this.contadorPedidos).padStart(4, '0')}`,
          itens: [],
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
        return of(venda).pipe(delay(1000));
      })
    );
  }

  consultarPorId(id: number): Observable<Venda | null> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(
      map(v => v ? this.mapVenda(v) : null),
      catchError(() => of(null))
    );
  }

  listarPorCliente(clienteId: number): Observable<Venda[]> {
    return this.http.get<any[]>(`${this.base}/cliente/${clienteId}`).pipe(
      map(data => data.map(v => this.mapVenda(v))),
      catchError(() => of([]))
    );
  }

  private mapVenda(v: any): Venda {
    return {
      id: v.id,
      clienteId: v.clienteId,
      codigoPedido: v.codigoPedido,
      itens: v.itens?.map((i: any) => ({
        produtoId: i.produtoId,
        produtoNome: i.produtoNome,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        subtotal: i.subtotal,
      })) || [],
      enderecoEntrega: v.enderecoEntrega,
      frete: {
        id: v.freteTipo,
        nome: v.freteTipo,
        prazoDias: v.fretePrazoDias,
        valor: v.freteValor,
      },
      pagamentosCartao: v.pagamentosCartao?.map((p: any) => ({
        cartaoId: p.cartaoId,
        valor: p.valor,
      })) || [],
      cupomPromocional: v.cupomPromocionalId ? {
        id: v.cupomPromocionalId,
        codigo: v.cupomPromocionalCodigo,
        tipo: 'PROMOCIONAL',
        valor: v.descontoPromocional,
        validoAte: '',
      } : null,
      cuponsTroca: [],
      subtotal: v.subtotal,
      descontoPromocional: v.descontoPromocional,
      descontoTroca: v.descontoTroca,
      valorFrete: v.valorFrete,
      total: v.total,
      status: v.status,
      dataCriacao: v.dataCriacao,
    };
  }
}
