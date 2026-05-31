import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Produto } from '../models/produto.model';

export interface ProdutoSugerido {
  id: number;
  nome: string;
  marca: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoria: string;
  estoque: number;
}

export interface RespostaChat {
  resposta: string;
  produtos: ProdutoSugerido[];
  sugestoes: string[];
}

export interface Mensagem {
  tipo: 'user' | 'bot';
  texto: string;
  produtos?: ProdutoSugerido[];
}

@Injectable({ providedIn: 'root' })
export class RecomendacaoService {
  constructor(private http: HttpClient) {}

  enviarMensagem(mensagem: string) {
    return this.http.post<RespostaChat>('/api/v1/recomendacao/chat', { mensagem });
  }
}
