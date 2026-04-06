import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { Venda, STATUS_LABELS, STATUS_COLORS, StatusVenda } from '../../../core/models/venda.model';

@Component({
  selector: 'app-pedido-confirmado',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="page-wrapper" style="max-width: 800px; text-align: center">
      @if (venda()) {
        <div class="confirmacao-icon">✅</div>
        <h1 class="page-header__titulo" style="margin-bottom: 8px">Pedido Confirmado!</h1>
        <p style="color: var(--mudo); margin-bottom: 32px">
          Seu pedido foi recebido e está sendo processado.
        </p>

        <div class="card" style="text-align: left; margin-bottom: 24px">
          <div class="card__header">
            <span class="card__titulo">Pedido {{ venda()?.codigoPedido }}</span>
            <span class="status" [class]="'status--' + statusColor()">
              {{ statusLabel() }}
            </span>
          </div>

          <div class="grid-2" style="gap: 24px">
            <div>
              <h4 style="font-size: .75rem; color: var(--mudo); margin-bottom: 12px">Data do Pedido</h4>
              <p style="font-size: .9rem">{{ venda()?.dataCriacao | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <div>
              <h4 style="font-size: .75rem; color: var(--mudo); margin-bottom: 12px">Prazo de Entrega</h4>
              <p style="font-size: .9rem">{{ venda()?.frete?.nome }} · {{ venda()?.frete?.prazoDias }} dias úteis</p>
            </div>
          </div>
        </div>

        <div class="card" style="text-align: left; margin-bottom: 24px">
          <div class="card__header">
            <span class="card__titulo">Endereço de Entrega</span>
          </div>
          @if (venda()?.enderecoEntrega; as end) {
            <p style="font-size: .9rem; line-height: 1.6">
              <strong>{{ end.apelido }}</strong><br>
              {{ end.tipoLogradouro }} {{ end.logradouro }}, {{ end.numero }}<br>
              {{ end.bairro }} · {{ end.cidade }}/{{ end.estado }}<br>
              CEP: {{ end.cep }}
            </p>
          }
        </div>

        <div class="card" style="text-align: left; margin-bottom: 24px">
          <div class="card__header">
            <span class="card__titulo">Pagamento</span>
          </div>

          <div style="font-size: .85rem; color: var(--claro)">
            <div class="resumo-linha">
              <span>Subtotal</span>
              <span>{{ venda()?.subtotal | currency:'BRL' }}</span>
            </div>
            @if (venda()?.descontoPromocional) {
              <div class="resumo-linha resumo-linha--desconto">
                <span>Cupom promocional</span>
                <span>-{{ venda()?.descontoPromocional | currency:'BRL' }}</span>
              </div>
            }
            @if (venda()?.descontoTroca) {
              <div class="resumo-linha resumo-linha--desconto">
                <span>Cupons de troca</span>
                <span>-{{ venda()?.descontoTroca | currency:'BRL' }}</span>
              </div>
            }
            <div class="resumo-linha">
              <span>Frete</span>
              <span>{{ venda()?.valorFrete | currency:'BRL' }}</span>
            </div>
            <div class="resumo-total">
              <span>Total Pago</span>
              <span>{{ venda()?.total | currency:'BRL' }}</span>
            </div>
          </div>
        </div>

        <div class="alert alert--info" style="margin-bottom: 24px; text-align: left">
          📧 Um e-mail de confirmação foi enviado para você com os detalhes do pedido.
        </div>

        <div style="display: flex; gap: 12px; justify-content: center">
          <a routerLink="/produtos" class="btn btn--primary btn--lg">
            Continuar Comprando
          </a>
          <a routerLink="/clientes" class="btn btn--ghost btn--lg">
            Meus Pedidos
          </a>
        </div>
      }

      @if (!venda()) {
        <div class="empty-state">
          <div class="empty-state__icon">📦</div>
          <div class="empty-state__title">Pedido não encontrado</div>
          <div class="empty-state__sub">Verifique o código do pedido.</div>
          <a routerLink="/produtos" class="btn btn--primary" style="margin-top: 16px">
            Ver Produtos
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirmacao-icon {
      font-size: 5rem;
      margin-bottom: 16px;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .status--azul {
      background: rgba(59,130,246,.12);
      color: #93c5fd;
    }
    .status--verde {
      background: rgba(34,197,94,.12);
      color: #86efac;
    }
    .status--laranja {
      background: rgba(255,77,0,.12);
      color: #fca5a5;
    }

    .resumo-linha {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .resumo-linha--desconto {
      color: var(--verde);
    }
    .resumo-total {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      margin-top: 8px;
      border-top: 1px solid var(--borda);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 1.1rem;
    }
  `]
})
export class PedidoConfirmadoComponent {
  private readonly route = inject(ActivatedRoute);

  venda = signal<Venda | null>(null);

  constructor() {
    // Recebe a venda via Router state
    const nav = window.history.state;
    if (nav?.venda) {
      this.venda.set(nav.venda);
    }
  }

  statusLabel(): string {
    const status = this.venda()?.status as StatusVenda | undefined;
    return status ? STATUS_LABELS[status] : '';
  }

  statusColor(): string {
    const status = this.venda()?.status as StatusVenda | undefined;
    return status ? STATUS_COLORS[status] : 'azul';
  }
}
