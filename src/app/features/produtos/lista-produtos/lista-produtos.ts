import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

import { ProdutoService } from '../../../core/services/produto.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { Produto } from '../../../core/models/produto.model';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-header__rotulo">RF0015 – Catálogo</div>
          <h1 class="page-header__titulo">Produtos</h1>
          <p class="page-header__sub">
            {{ produtos().length }} produtos disponíveis
          </p>
        </div>
        <div class="page-header__actions">
          <a routerLink="/carrinho" class="btn btn--primary">
            🛒 Carrinho
            @if (quantidadeItens() > 0) {
              <span class="badge">{{ quantidadeItens() }}</span>
            }
          </a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom: 24px">
        <div class="form-row form-row--3">
          <div class="form-group" style="margin-bottom: 0">
            <label>Buscar</label>
            <input
              [formControl]="filtroNome"
              type="text"
              placeholder="Nome ou marca..."
            />
          </div>
          <div class="form-group" style="margin-bottom: 0">
            <label>Categoria</label>
            <select [formControl]="filtroCategoria">
              <option value="">Todas</option>
              <option value="SUPLEMENTO">Suplementos</option>
              <option value="ACESSORIO">Acessórios</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0; display: flex; align-items: flex-end">
            <button (click)="limparFiltros()" class="btn btn--ghost">
              Limpar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (carregando()) {
        <div class="loading-state">
          <span class="spinner"></span> Carregando produtos…
        </div>
      }

      <!-- Grid de produtos -->
      @if (!carregando()) {
        <div class="produtos-grid">
          @for (produto of produtosFiltrados(); track produto.id) {
            <div class="produto-card">
              <div class="produto-card__img">
                <img [src]="produto.imagemUrl" [alt]="produto.nome" />
                @if (produto.precoPromocional) {
                  <span class="produto-card__tag">PROMO</span>
                }
              </div>
              <div class="produto-card__body">
                <span class="produto-card__marca">{{ produto.marca }}</span>
                <h3 class="produto-card__nome">{{ produto.nome }}</h3>
                <p class="produto-card__desc">{{ produto.descricao }}</p>
                <div class="produto-card__preco">
                  @if (produto.precoPromocional) {
                    <span class="preco-antigo">{{ produto.preco | currency:'BRL' }}</span>
                  }
                  <span class="preco-atual">
                    {{ (produto.precoPromocional ?? produto.preco) | currency:'BRL' }}
                  </span>
                </div>
                <div class="produto-card__actions">
                  <button
                    (click)="adicionarAoCarrinho(produto)"
                    class="btn btn--primary btn--full"
                    [disabled]="produto.estoque === 0 || adicionando() === produto.id">
                    @if (adicionando() === produto.id) {
                      <span class="spinner" style="width:14px;height:14px;border-top-color:var(--preto)"></span>
                      Adicionando…
                    } @else if (produto.estoque === 0) {
                      ❌ Sem estoque
                    } @else {
                      🛒 Adicionar
                    }
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        @if (produtosFiltrados().length === 0) {
          <div class="empty-state">
            <div class="empty-state__icon">📦</div>
            <div class="empty-state__title">Nenhum produto encontrado</div>
            <div class="empty-state__sub">Ajuste os filtros para ver mais resultados.</div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .badge {
      background: var(--preto);
      color: var(--acento);
      font-size: .65rem;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 6px;
    }

    .produtos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .produto-card {
      background: var(--escuro);
      border: 1px solid var(--borda);
      border-radius: 4px;
      overflow: hidden;
      transition: border-color .2s, transform .15s;
    }

    .produto-card:hover {
      border-color: var(--acento);
      transform: translateY(-2px);
    }

    .produto-card__img {
      position: relative;
      height: 180px;
      background: var(--painel);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .produto-card__img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .produto-card__tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--laranja);
      color: var(--preto);
      font-size: .65rem;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 3px;
    }

    .produto-card__body {
      padding: 16px;
    }

    .produto-card__marca {
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--acento);
    }

    .produto-card__nome {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      margin: 4px 0 8px;
      line-height: 1.3;
    }

    .produto-card__desc {
      font-size: .78rem;
      color: var(--mudo);
      line-height: 1.5;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .produto-card__preco {
      margin-bottom: 12px;
    }

    .preco-antigo {
      font-size: .75rem;
      color: var(--mudo);
      text-decoration: line-through;
      display: block;
    }

    .preco-atual {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.3rem;
      font-weight: 900;
      color: var(--verde);
    }
  `]
})
export class ListaProdutosComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinhoService = inject(CarrinhoService);

  produtos = signal<Produto[]>([]);
  carregando = signal(false);
  adicionando = signal<number | null>(null);

  filtroNome = new FormControl('');
  filtroCategoria = new FormControl('');

  quantidadeItens = this.carrinhoService.quantidadeItens;

  produtosFiltrados = computed(() => {
    const lista = this.produtos();
    const nome = this.filtroNome.value?.toLowerCase() ?? '';
    const categoria = this.filtroCategoria.value ?? '';

    return lista.filter((p) => {
      const matchNome = !nome ||
        p.nome.toLowerCase().includes(nome) ||
        p.marca.toLowerCase().includes(nome);
      const matchCategoria = !categoria || p.categoria === categoria;
      return matchNome && matchCategoria;
    });
  });

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando.set(true);
    this.produtoService.listarTodos().subscribe({
      next: (data) => {
        this.produtos.set(data);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }

  limparFiltros(): void {
    this.filtroNome.reset();
    this.filtroCategoria.reset();
  }

  adicionarAoCarrinho(produto: Produto): void {
    this.adicionando.set(produto.id);

    setTimeout(() => {
      this.carrinhoService.adicionarItem(produto, 1);
      this.adicionando.set(null);
    }, 300);
  }
}
