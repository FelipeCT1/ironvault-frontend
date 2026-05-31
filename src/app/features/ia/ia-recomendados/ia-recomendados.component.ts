import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecomendacaoService, type ProdutoSugerido } from '../../../core/services/recomendacao.service';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-ia-recomendados',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, LoadingComponent, EmptyStateComponent],
  template: `
    <div class="alert alert-info">🤖 Produtos selecionados pela IA com base no seu perfil e histórico de compras.</div>

    @if (carregando()) {
      <app-loading mensagem="Calculando recomendações..." />
    } @else if (produtos().length === 0) {
      <app-empty-state icone="🎯" titulo="Nenhuma recomendação ainda" sub="Converse com o assistente IA para receber recomendações personalizadas">
        <a class="btn btn-primary btn-sm" routerLink="/ia" fragment="chat">Ir para o Chat</a>
      </app-empty-state>
    } @else {
      <div class="grid-4">
        @for (prod of produtos(); track prod.id) {
          <div class="prod-wrapper card-produto-mini">
            <span class="rec-badge">Recomendado</span>
            <div class="prod-img" style="background:var(--painel);display:flex;align-items:center;justify-content:center;font-size:2.5rem">
              🏋️
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
export class IaRecomendadosComponent {
  private recomendacaoService = inject(RecomendacaoService);

  protected readonly produtos = signal<ProdutoSugerido[]>([]);
  protected readonly carregando = signal(false);

  ngOnInit() {
    this.carregarRecomendacoes();
  }

  private carregarRecomendacoes() {
    this.carregando.set(true);
    this.recomendacaoService.enviarMensagem(
      'Quais produtos você recomenda para mim hoje? Considere meu perfil e histórico.'
    ).subscribe({
      next: (res) => {
        this.produtos.set(res.produtos);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
