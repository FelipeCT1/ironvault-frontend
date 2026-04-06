import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Produto, FiltroProduto } from '../models/produto.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/produtos';

  listarTodos(): Observable<Produto[]> {
    return this.http.get<any[]>(this.base).pipe(
      map(data => data.map(p => this.mapProduto(p)))
    );
  }

  buscarPorId(id: number): Observable<Produto | undefined> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(
      map(p => p ? this.mapProduto(p) : undefined)
    );
  }

  buscar(filtro: FiltroProduto): Observable<Produto[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.categoria) params = params.set('categoriaId', this.getCategoriaId(filtro.categoria));

    return this.http.get<any[]>(`${this.base}/busca`, { params }).pipe(
      map(data => data.map(p => this.mapProduto(p)))
    );
  }

  private mapProduto(p: any): Produto {
    return {
      id: p.id,
      nome: p.nome,
      marca: p.marca,
      descricao: p.descricao,
      preco: p.valorVenda,
      categoria: p.categoria?.nome || p.categoria,
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
    };
  }

  private getCategoriaId(categoria: string): string {
    const map: Record<string, string> = {
      'SUPLEMENTO': '1',
      'ACESSORIO': '2',
      'MEDICAMENTO_CONTROLADO': '3',
    };
    return map[categoria] || '';
  }
}
