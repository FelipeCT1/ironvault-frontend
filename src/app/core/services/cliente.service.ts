import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, AlterarSenhaDTO, FiltroCliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/clientes';

  // POST /api/v1/clientes
  criar(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.base, cliente);
  }

  // GET /api/v1/clientes/buscaGeral
  listarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.base}/buscaGeral`);
  }

  // GET /api/v1/clientes/busca?nome=&cpf=&email=
  buscar(filtro: FiltroCliente): Observable<Cliente[]> {
    let params = new HttpParams();
    if (filtro.nome)  params = params.set('nome',  filtro.nome);
    if (filtro.cpf)   params = params.set('cpf',   filtro.cpf);
    if (filtro.email) params = params.set('email', filtro.email);
    return this.http.get<Cliente[]>(`${this.base}/busca`, { params });
  }

  // PATCH /api/v1/clientes/{id}/inativar
  inativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/inativar`, null);
  }

  // PATCH /api/v1/clientes/{id}/alterar-senha
  alterarSenha(id: number, dto: AlterarSenhaDTO): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/alterar-senha`, dto);
  }

  // PUT /api/v1/clientes/{id}  ← adicionar no backend (aviso abaixo)
  atualizar(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.base}/${id}`, cliente);
  }
}