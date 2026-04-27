import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VendaService } from '../../../core/services/venda.service';
import type { Venda } from '../../../core/models/venda.model';
import { STATUS_LABELS, STATUS_CORES } from '../../../core/models/venda.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-detalhe-pedido',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, LoadingComponent, AlertComponent, StatusBadgeComponent],
  template: `
    <div class="conteudo">
      @if (carregando()) {
        <app-loading mensagem="Carregando pedido..." />
      } @else if (venda()) {
        <a routerLink="/pedidos" style="color: var(--mudo); font-size: 0.78rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 8px;">
          ← Voltar para Pedidos
        </a>

        <div class="page-header" style="margin-bottom: 20px;">
          <div>
            <div class="page-header-label">Pedido</div>
            <h1>{{ venda()!.codigoPedido }}</h1>
            <p class="page-header-sub">{{ venda()!.dataCriacao | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <app-status-badge [label]="STATUS_LABELS[venda()!.status]" [cor]="STATUS_CORES[venda()!.status]" />
        </div>

        <div class="grid-2">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card">
              <div class="card-header">
                <span class="card-titulo">Andamento</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                @for (status of timeline; track status; let last = $last) {
                  <div style="display: flex; gap: 12px;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                      <div
                        [style.background]="getTimelineCor(status)"
                        style="width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;"
                      ></div>
                      @if (!last) {
                        <div style="width: 2px; flex: 1; background: var(--borda); min-height: 16px;"></div>
                      }
                    </div>
                    <div style="padding-bottom: 8px;">
                      <strong [style.color]="getTimelineCor(status)">{{ STATUS_LABELS[status] }}</strong>
                      <p class="stat-sub" style="margin-top: 2px;">
                        @if (venda()!.status === status) {
                          {{ venda()!.dataCriacao | date:'dd/MM/yyyy' }}
                        } @else {
                          —
                        }
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="card-titulo">Itens</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                @for (item of venda()!.itens; track item.produtoId) {
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--borda);">
                    <div>
                      <strong style="color: var(--branco); display: block;">{{ item.produtoNome }}</strong>
                      <span style="font-size: 0.78rem; color: var(--mudo);">{{ item.quantidade }} × {{ item.precoUnitario | currency:'BRL' }}</span>
                    </div>
                    <strong class="prod-preco">{{ item.subtotal ?? item.precoUnitario * item.quantidade | currency:'BRL':'symbol':'1.2-2' }}</strong>
                  </div>
                }
              </div>
            </div>

            @if (venda()!.status === 'ENTREGUE') {
              <a routerLink="/trocas/nova" class="btn btn-purple">🔄 Solicitar Troca de Item</a>
            }
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card">
              <div class="card-header">
                <span class="card-titulo">Entrega</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--claro); line-height: 1.6;">
                {{ venda()!.enderecoEntrega.logradouro }}, {{ venda()!.enderecoEntrega.numero }}<br />
                {{ venda()!.enderecoEntrega.bairro }} - {{ venda()!.enderecoEntrega.cidade }}/{{ venda()!.enderecoEntrega.estado }}<br />
                CEP: {{ venda()!.enderecoEntrega.cep }}
              </p>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--borda);">
                <span style="font-size: 0.78rem; color: var(--mudo);">Frete: {{ venda()!.freteTipo }} · {{ venda()!.fretePrazoDias }} dias</span>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="card-titulo">Resumo Financeiro</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div class="subtotal">
                  <span>Subtotal</span>
                  <span>{{ venda()!.subtotal | currency:'BRL':'symbol':'1.2-2' }}</span>
                </div>
                @if (venda()!.descontoPromocional > 0) {
                  <div class="subtotal">
                    <span style="color: var(--verde);">Desconto Promocional</span>
                    <span style="color: var(--verde);">-{{ venda()!.descontoPromocional | currency:'BRL' }}</span>
                  </div>
                }
                @if (venda()!.descontoTroca > 0) {
                  <div class="subtotal">
                    <span style="color: var(--roxo);">Troca</span>
                    <span style="color: var(--roxo);">-{{ venda()!.descontoTroca | currency:'BRL' }}</span>
                  </div>
                }
                <div class="subtotal">
                  <span>Frete</span>
                  <span>{{ venda()!.valorFrete | currency:'BRL' }}</span>
                </div>
                <div style="border-top: 1px solid var(--borda); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <strong>Total</strong>
                  <strong class="prod-preco" style="font-size: 1.2rem;">{{ venda()!.total | currency:'BRL':'symbol':'1.2-2' }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <app-alert tipo="danger" mensagem="Pedido não encontrado." />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalhePedidoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly vendaService = inject(VendaService);

  protected venda = signal<Venda | null>(null);
  protected carregando = signal(true);
  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly STATUS_CORES = STATUS_CORES;

  protected timeline = ['EM_PROCESSAMENTO', 'APROVADA', 'EM_TRANSITO', 'ENTREGUE'] as const;

  private readonly STATUS_TIMELINE_CORES: Record<string, string> = {
    EM_PROCESSAMENTO: 'var(--azul)',
    APROVADA: 'var(--verde)',
    REPROVADA: 'var(--laranja)',
    EM_TRANSITO: 'var(--acento)',
    ENTREGUE: 'var(--verde)',
    EM_TROCA: 'var(--roxo)',
    TROCA_AUTORIZADA: 'var(--roxo)',
    TROCADO: 'var(--verde)',
  };

  protected getTimelineCor(status: string): string {
    return this.STATUS_TIMELINE_CORES[status] ?? 'var(--mudo)';
  }

  constructor() {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.vendaService.consultarPorId(id).subscribe({
        next: (venda) => {
          this.venda.set(venda);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
    }
  }
}
