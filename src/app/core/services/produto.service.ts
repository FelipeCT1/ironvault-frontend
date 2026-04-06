import { Injectable } from '@angular/core';
import { Produto, FiltroProduto } from '../models/produto.model';
import { of, Observable, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly produtos: Produto[] = [
    {
      id: 1,
      nome: 'Whey Protein Concentrate',
      marca: 'Growth',
      descricao: 'Proteína do soro do leite concentrada. Ideal para ganho de massa muscular.',
      preco: 89.90,
      precoPromocional: 79.90,
      categoria: 'SUPLEMENTO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=Whey',
      estoque: 50,
      peso: 1.0,
      dimensoes: { altura: 20, largura: 15, profundidade: 10 },
    },
    {
      id: 2,
      nome: 'Creatina Micronizada',
      marca: 'Max Titanium',
      descricao: 'Creatina monohidratada micronizada de alta pureza.',
      preco: 59.90,
      categoria: 'SUPLEMENTO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=Creatina',
      estoque: 30,
      peso: 0.3,
      dimensoes: { altura: 10, largura: 10, profundidade: 5 },
    },
    {
      id: 3,
      nome: 'Pré-Treino Caffeine',
      marca: 'Insanity Labs',
      descricao: 'Pré-treino com alta dose de cafeína e beta-alanina.',
      preco: 119.90,
      categoria: 'SUPLEMENTO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=Pre-Treino',
      estoque: 20,
      peso: 0.4,
      dimensoes: { altura: 12, largura: 10, profundidade: 6 },
    },
    {
      id: 4,
      nome: 'BCAA 2:1:1',
      marca: 'Growth',
      descricao: 'Aminoácidos de cadeia ramificada na proporção 2:1:1.',
      preco: 69.90,
      categoria: 'SUPLEMENTO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=BCAA',
      estoque: 40,
      peso: 0.3,
      dimensoes: { altura: 10, largura: 8, profundidade: 8 },
    },
    {
      id: 5,
      nome: 'Glutamina',
      marca: 'Probiótica',
      descricao: 'Glutamina livre para recuperação muscular.',
      preco: 49.90,
      categoria: 'SUPLEMENTO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=Glutamina',
      estoque: 35,
      peso: 0.3,
      dimensoes: { altura: 10, largura: 8, profundidade: 8 },
    },
    {
      id: 6,
      nome: 'Multivitamínico',
      marca: 'Universal',
      descricao: 'Complexo de vitaminas e minerais essenciais.',
      preco: 39.90,
      categoria: 'SUPLEMENTO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=Multi',
      estoque: 60,
      peso: 0.2,
      dimensoes: { altura: 12, largura: 6, profundidade: 6 },
    },
    {
      id: 7,
      nome: 'Ômega 3',
      marca: 'Madre Labs',
      descricao: 'Óleo de peixe concentrado em EPA e DHA.',
      preco: 54.90,
      categoria: 'SUPLEMENTO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=Omega3',
      estoque: 25,
      peso: 0.2,
      dimensoes: { altura: 10, largura: 6, profundidade: 6 },
    },
    {
      id: 8,
      nome: 'Shaker 600ml',
      marca: 'IronVault',
      descricao: 'Shaker com divisória para suplementos.',
      preco: 29.90,
      categoria: 'ACESSORIO',
      imagemUrl: 'https://via.placeholder.com/300x300?text=Shaker',
      estoque: 100,
      peso: 0.15,
      dimensoes: { altura: 22, largura: 8, profundidade: 8 },
    },
  ];

  listarTodos(): Observable<Produto[]> {
    return of([...this.produtos]).pipe(delay(200));
  }

  buscarPorId(id: number): Observable<Produto | undefined> {
    const produto = this.produtos.find((p) => p.id === id);
    return of(produto).pipe(delay(100));
  }

  buscar(filtro: FiltroProduto): Observable<Produto[]> {
    let resultado = [...this.produtos];

    if (filtro.nome) {
      const termo = filtro.nome.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          p.marca.toLowerCase().includes(termo)
      );
    }

    if (filtro.categoria) {
      resultado = resultado.filter((p) => p.categoria === filtro.categoria);
    }

    return of(resultado).pipe(delay(150));
  }
}
