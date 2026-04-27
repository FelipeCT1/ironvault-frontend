import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Venda, FinalizarCompraDTO } from '../models/venda.model';

@Injectable({ providedIn: 'root' })
export class VendaService {
  constructor(private http: HttpClient) {}

  finalizarCompra(dto: FinalizarCompraDTO) {
    return this.http.post<Venda>('/api/v1/vendas', dto);
  }

  consultarPorId(id: number) {
    return this.http.get<Venda>(`/api/v1/vendas/${id}`);
  }

  consultarPorCodigo(codigo: string) {
    return this.http.get<Venda>(`/api/v1/vendas/codigo/${codigo}`);
  }

  listarPorCliente(clienteId: number) {
    return this.http.get<Venda[]>(`/api/v1/vendas/cliente/${clienteId}`);
  }

  listarTodas() {
    return this.http.get<Venda[]>('/api/v1/vendas');
  }

  atualizarStatus(id: number, acao: string) {
    return this.http.patch<Venda>(`/api/v1/vendas/${id}/${acao}`, {});
  }
}
