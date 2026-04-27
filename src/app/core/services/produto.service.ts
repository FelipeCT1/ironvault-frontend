import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import type { Produto, FiltroProduto } from '../models/produto.model';

interface ProdutoBackend {
  id: number;
  nome: string;
  marca: string;
  descricao: string;
  valorVenda: number;
  imagemUrl?: string;
  estoque: number;
  peso: number;
  altura: number;
  largura: number;
  profundidade: number;
  controlado?: boolean;
  prescricaoObrigatoria?: boolean;
  categoria?: { id: number; nome: string };
  grupoPrecificacao?: { id: number; nome: string; margemLucro: number };
}

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  constructor(private http: HttpClient) {}

  private mapProduto(p: ProdutoBackend): Produto {
    return {
      id: p.id,
      nome: p.nome,
      marca: p.marca,
      descricao: p.descricao,
      preco: p.valorVenda,
      imagemUrl: p.imagemUrl,
      estoque: p.estoque,
      peso: p.peso,
      dimensoes: {
        altura: p.altura,
        largura: p.largura,
        profundidade: p.profundidade,
      },
      controlado: p.controlado,
      prescricaoObrigatoria: p.prescricaoObrigatoria,
      categoria: p.categoria?.nome ?? '',
    };
  }

  listarTodos() {
    return this.http
      .get<ProdutoBackend[]>('/api/v1/produtos')
      .pipe(map((produtos) => produtos.map((p) => this.mapProduto(p))));
  }

  buscarPorId(id: number) {
    return this.http
      .get<ProdutoBackend>(`/api/v1/produtos/${id}`)
      .pipe(map((p) => this.mapProduto(p)));
  }

  buscar(filtro: FiltroProduto) {
    const params: Record<string, string> = {};
    if (filtro.nome) params['nome'] = filtro.nome;
    if (filtro.categoriaId) params['categoriaId'] = String(filtro.categoriaId);
    return this.http
      .get<ProdutoBackend[]>('/api/v1/produtos/busca', { params })
      .pipe(map((produtos) => produtos.map((p) => this.mapProduto(p))));
  }
}
