import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Cliente, FiltroCliente, AlterarSenhaDTO } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  constructor(private http: HttpClient) {}

  criar(cliente: Partial<Cliente>) {
    return this.http.post<Cliente>('/api/v1/clientes', cliente);
  }

  listarTodos() {
    return this.http.get<Cliente[]>('/api/v1/clientes');
  }

  buscarPorId(id: number) {
    return this.http.get<Cliente>(`/api/v1/clientes/${id}`);
  }

  buscar(filtro: FiltroCliente) {
    const params: Record<string, string> = {};
    if (filtro.nome) params['nome'] = filtro.nome;
    if (filtro.cpf) params['cpf'] = filtro.cpf;
    if (filtro.email) params['email'] = filtro.email;
    return this.http.get<Cliente[]>('/api/v1/clientes/busca', { params });
  }

  atualizar(id: number, cliente: Partial<Cliente>) {
    return this.http.put<Cliente>(`/api/v1/clientes/${id}`, cliente);
  }

  inativar(id: number) {
    return this.http.patch<void>(`/api/v1/clientes/${id}/inativar`, {});
  }

  ativar(id: number) {
    return this.http.patch<void>(`/api/v1/clientes/${id}/ativar`, {});
  }

  alterarSenha(id: number, dto: AlterarSenhaDTO) {
    return this.http.patch<void>(`/api/v1/clientes/${id}/alterar-senha`, dto);
  }
}
