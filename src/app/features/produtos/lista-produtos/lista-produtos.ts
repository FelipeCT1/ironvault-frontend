import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ProdutoService } from '../../../core/services/produto.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import type { Produto } from '../../../core/models/produto.model';
import { CurrencyPipe } from '@angular/common';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CurrencyPipe, LoadingComponent, EmptyStateComponent, AlertComponent, FormsModule],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Catálogo</div>
          <h1>Produtos</h1>
        </div>
        <div class="search-bar">
          <input
            class="form-control"
            placeholder="Buscar por nome ou marca..."
            [(ngModel)]="filtroNome"
            (ngModelChange)="buscar()"
          />
          <select class="form-control" [(ngModel)]="filtroCategoria" (ngModelChange)="buscar()">
            <option value="">Todas as categorias</option>
            <option value="1">Suplementos</option>
            <option value="2">Acessórios</option>
            <option value="3">Medicamentos</option>
          </select>
        </div>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando produtos..." />
      } @else if (produtos().length === 0) {
        <app-empty-state icone="💪" titulo="Nenhum produto encontrado" sub="Tente ajustar os filtros de busca">
          <button class="btn btn-secondary btn-sm" (click)="limparFiltros()">Limpar Filtros</button>
        </app-empty-state>
      } @else {
        <div class="grid-4">
          @for (produto of produtos(); track produto.id) {
            <div class="card-produto-mini">
              <div class="prod-img">
                💊
              </div>
              <div class="prod-info">
                <div class="prod-cat">{{ produto.marca }}</div>
                <h3 class="prod-nome">{{ produto.nome }}</h3>
                <p class="prod-sabor">{{ produto.descricao }}</p>
                @if (produto.controlado) {
                  <span class="s-laranja">Controlado</span>
                }
                <div class="prod-rodape">
                  <span class="prod-preco">{{ produto.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                  <button
                    class="btn btn-primary btn-sm"
                    [disabled]="produto.estoque === 0"
                    (click)="adicionar(produto)"
                  >
                    @if (produto.estoque === 0) {
                      Indisponível
                    } @else {
                      Adicionar
                    }
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaProdutosComponent {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinhoService = inject(CarrinhoService);

  protected produtos = signal<Produto[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');
  protected filtroNome = '';
  protected filtroCategoria = '';

  constructor() {
    console.log('[ListaProdutosComponent] construct');
    this.carregar();
  }

  private carregar() {
    this.carregando.set(true);
    this.erro.set('');

    this.produtoService.listarTodos().subscribe({
      next: (produtos) => {
        console.log('[Produtos] recebidos:', produtos.length);
        this.produtos.set(produtos);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('[Produtos] erro:', err);
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  buscar() {
    this.carregando.set(true);
    this.erro.set('');

    const filtro: Record<string, string> = {};
    if (this.filtroNome) filtro['nome'] = this.filtroNome;
    if (this.filtroCategoria) filtro['categoriaId'] = this.filtroCategoria;

    this.produtoService.buscar(filtro).subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('[Produtos] buscar erro:', err);
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  limparFiltros() {
    this.filtroNome = '';
    this.filtroCategoria = '';
    this.carregar();
  }

  adicionar(produto: Produto) {
    this.carrinhoService.adicionarItem(produto, 1);
  }
}
