import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VendaService } from '../../../core/services/venda.service';
import type { Venda } from '../../../core/models/venda.model';
import { STATUS_LABELS, STATUS_CORES } from '../../../core/models/venda.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-pedido-confirmado',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LoadingComponent, AlertComponent, StatusBadgeComponent],
  template: `
    <div class="conteudo" style="max-width: 680px; margin: 0 auto;">
      @if (carregando()) {
        <app-loading mensagem="Carregando pedido..." />
      } @else if (venda()) {
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 56px; margin-bottom: 12px;">✅</div>
          <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 28px; color: var(--verde); margin-bottom: 4px;">Pedido Confirmado!</h1>
          <p style="color: var(--mudo);">Seu pedido foi registrado com sucesso.</p>
        </div>

        <div class="card" style="text-align: center; margin-bottom: 20px;">
          <div class="rotulo">Código do Pedido</div>
          <div style="font-family: 'Barlow Condensed', sans-serif; font-size: 32px; color: var(--acento); font-weight: 900; margin: 8px 0;">{{ venda()!.codigoPedido }}</div>
          <app-status-badge [label]="STATUS_LABELS[venda()!.status]" [cor]="STATUS_CORES[venda()!.status]" />
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header">
            <span class="card-titulo">Itens</span>
          </div>
          @for (item of venda()!.itens; track item.produtoId) {
            <div class="subtotal" style="border-bottom: 1px solid var(--borda); padding-bottom: 8px; margin-bottom: 8px;">
              <span>{{ item.produtoNome }} × {{ item.quantidade }}</span>
              <strong style="color: var(--branco);">{{ item.precoUnitario * item.quantidade | currency:'BRL':'symbol':'1.2-2' }}</strong>
            </div>
          }
        </div>

        <div class="card" style="margin-bottom: 28px;">
          <div class="subtotal">
            <span>Subtotal</span>
            <span>{{ venda()!.subtotal | currency:'BRL':'symbol':'1.2-2' }}</span>
          </div>
          @if (venda()!.descontoPromocional > 0) {
            <div class="subtotal">
              <span style="color: var(--verde);">Desconto</span>
              <span style="color: var(--verde);">-{{ venda()!.descontoPromocional | currency:'BRL' }}</span>
            </div>
          }
          <div class="subtotal">
            <span>Frete</span>
            <span>{{ venda()!.valorFrete | currency:'BRL' }}</span>
          </div>
          <div style="border-top: 1px solid var(--borda); padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <strong>Total</strong>
            <strong class="prod-preco" style="font-size: 1.4rem;">{{ venda()!.total | currency:'BRL':'symbol':'1.2-2' }}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center;">
          <a routerLink="/produtos" class="btn btn-primary">Continuar Comprando</a>
          <a routerLink="/pedidos" class="btn btn-secondary">Ver Meus Pedidos</a>
        </div>
      } @else {
        <app-alert tipo="danger" mensagem="Pedido não encontrado." />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoConfirmadoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly vendaService = inject(VendaService);

  protected venda = signal<Venda | null>(null);
  protected carregando = signal(true);
  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly STATUS_CORES = STATUS_CORES;

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
