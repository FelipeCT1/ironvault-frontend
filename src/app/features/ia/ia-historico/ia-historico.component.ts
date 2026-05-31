import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecomendacaoService, type ProdutoSugerido } from '../../../core/services/recomendacao.service';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-ia-historico',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, LoadingComponent, EmptyStateComponent],
  template: `
    <div class="page-header">
      <div>
        <div class="rotulo">RF0055 · RNF0043</div>
        <h2>Recomendações Baseadas no Histórico</h2>
      </div>
    </div>

    @if (carregando()) {
      <app-loading mensagem="Analisando seu histórico..." />
    } @else if (produtos().length === 0) {
      <app-empty-state icone="📊" titulo="Sem histórico disponível" sub="Faça algumas compras para receber recomendações personalizadas baseadas no seu perfil">
        <a class="btn btn-primary btn-sm" routerLink="/produtos">Ver Produtos</a>
      </app-empty-state>
    } @else {
      <div class="alert alert-info">📊 Recomendações baseadas nas suas compras anteriores e no padrão de consumo.</div>
      <div class="grid-4">
        @for (prod of produtos(); track prod.id) {
          <div class="prod-wrapper card-produto-mini">
            <span class="rec-badge" style="background:var(--azul)">Histórico</span>
            <div class="prod-img" style="background:var(--painel);display:flex;align-items:center;justify-content:center;font-size:2.5rem">
              📦
            </div>
            <div class="prod-info">
              <div class="prod-cat">{{ prod.categoria }}</div>
              <div class="prod-nome">{{ prod.nome }}</div>
              <div style="font-size:.72rem;color:var(--mudo);margin-bottom:8px">{{ prod.marca }}</div>
              <div class="prod-rodape">
                <div class="prod-preco">{{ prod.preco | currency:'BRL':'symbol':'1.2-2' }}</div>
                <a class="btn btn-primary btn-sm" routerLink="/produtos">Ver</a>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IaHistoricoComponent {
  private recomendacaoService = inject(RecomendacaoService);

  protected readonly produtos = signal<ProdutoSugerido[]>([]);
  protected readonly carregando = signal(false);

  ngOnInit() {
    this.carregarHistorico();
  }

  private carregarHistorico() {
    this.carregando.set(true);
    this.recomendacaoService.enviarMensagem(
      'Analise meu histórico de compras e recomende produtos similares ou complementares aos que já comprei.'
    ).subscribe({
      next: (res) => {
        this.produtos.set(res.produtos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
