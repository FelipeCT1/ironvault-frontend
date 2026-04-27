import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Troca, SolicitarTrocaDTO } from '../models/troca.model';

@Injectable({ providedIn: 'root' })
export class TrocaService {
  constructor(private http: HttpClient) {}

  listarPorCliente(clienteId: number) {
    return this.http.get<Troca[]>(`/api/v1/trocas/cliente/${clienteId}`);
  }

  listarTodas() {
    return this.http.get<Troca[]>('/api/v1/trocas');
  }

  buscarPorId(id: number) {
    return this.http.get<Troca>(`/api/v1/trocas/${id}`);
  }

  solicitar(dto: SolicitarTrocaDTO) {
    return this.http.post<Troca>('/api/v1/trocas', dto);
  }

  autorizar(id: number) {
    return this.http.patch<Troca>(`/api/v1/trocas/${id}/autorizar`, {});
  }

  recusar(id: number) {
    return this.http.patch<Troca>(`/api/v1/trocas/${id}/recusar`, {});
  }

  concluir(id: number) {
    return this.http.patch<Troca>(`/api/v1/trocas/${id}/concluir`, {});
  }
}
