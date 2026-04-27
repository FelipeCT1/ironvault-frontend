import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { VendaService } from '../../../core/services/venda.service';
import { AuthService } from '../../../core/services/auth.service';
import type { Venda } from '../../../core/models/venda.model';
import { STATUS_LABELS, STATUS_CORES } from '../../../core/models/venda.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, LoadingComponent, EmptyStateComponent, AlertComponent, StatusBadgeComponent],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Pedidos</div>
          <h1>Meus Pedidos</h1>
        </div>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando pedidos..." />
      } @else if (pedidos().length === 0) {
        <app-empty-state icone="📋" titulo="Nenhum pedido encontrado" sub="Seus pedidos aparecerão aqui" />
      } @else {
        <div class="grid-4" style="margin-bottom: 24px;">
          <div class="stat-card verde">
            <div class="stat-rotulo">Entregues</div>
            <div class="stat-valor">{{ entregues() }}</div>
          </div>
          <div class="stat-card azul">
            <div class="stat-rotulo">Em Processamento</div>
            <div class="stat-valor">{{ processando() }}</div>
          </div>
          <div class="stat-card laranja">
            <div class="stat-rotulo">Em Trânsito</div>
            <div class="stat-valor">{{ emTransito() }}</div>
          </div>
          <div class="stat-card roxo">
            <div class="stat-rotulo">Em Troca</div>
            <div class="stat-valor">{{ emTroca() }}</div>
          </div>
        </div>

        <div class="card">
          <div class="tabela-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Data</th>
                  <th>Itens</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (pedido of pedidos(); track pedido.id) {
                  <tr [routerLink]="['/pedidos', pedido.id]" style="cursor: pointer;">
                    <td><strong>{{ pedido.codigoPedido }}</strong></td>
                    <td>{{ pedido.dataCriacao | date:'dd/MM/yyyy' }}</td>
                    <td>{{ pedido.itens.length }} item(ns)</td>
                    <td>{{ pedido.total | currency:'BRL':'symbol':'1.2-2' }}</td>
                    <td>
                      <app-status-badge [label]="STATUS_LABELS[pedido.status]" [cor]="STATUS_CORES[pedido.status]" />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaPedidosComponent {
  private readonly vendaService = inject(VendaService);
  private readonly auth = inject(AuthService);

  protected pedidos = signal<Venda[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');
  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly STATUS_CORES = STATUS_CORES;

  protected entregues = computed(() => this.pedidos().filter((p) => p.status === 'ENTREGUE' || p.status === 'TROCADO').length);
  protected processando = computed(() => this.pedidos().filter((p) => p.status === 'EM_PROCESSAMENTO' || p.status === 'APROVADA').length);
  protected emTransito = computed(() => this.pedidos().filter((p) => p.status === 'EM_TRANSITO').length);
  protected emTroca = computed(() => this.pedidos().filter((p) => p.status === 'EM_TROCA' || p.status === 'TROCA_AUTORIZADA').length);

  constructor() {
    const clienteId = this.auth['_clienteAtual']()?.id;
    if (clienteId) {
      this.vendaService.listarPorCliente(clienteId).subscribe({
        next: (pedidos) => {
          this.pedidos.set(pedidos);
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(err.message);
          this.carregando.set(false);
        },
      });
    }
  }
}
