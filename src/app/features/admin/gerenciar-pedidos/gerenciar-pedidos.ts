import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { VendaService } from '../../../core/services/venda.service';
import type { Venda } from '../../../core/models/venda.model';
import { STATUS_LABELS, STATUS_CORES } from '../../../core/models/venda.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { AlertComponent } from '../../../shared/components/alert/alert';

@Component({
  selector: 'app-gerenciar-pedidos',
  standalone: true,
  imports: [CurrencyPipe, LoadingComponent, AlertComponent],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Admin</div>
          <h1>Gerenciar Pedidos</h1>
        </div>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando pedidos..." />
      } @else {
        <div class="card">
          <div class="tabela-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (pedido of pedidos(); track pedido.id) {
                  <tr>
                    <td>{{ pedido.codigoPedido }}</td>
                    <td>{{ pedido.clienteNome }}</td>
                    <td>{{ pedido.total | currency:'BRL':'symbol':'1.2-2' }}</td>
                    <td>
                      <span class="status s-{{ STATUS_CORES[pedido.status] }}">
                        {{ STATUS_LABELS[pedido.status] }}
                      </span>
                    </td>
                    <td>
                      <div>
                        @if (pedido.status === 'EM_PROCESSAMENTO') {
                          <button class="btn btn-sm btn-success" (click)="acao(pedido.id, 'aprovar')">Aprovar</button>
                          <button class="btn btn-sm btn-danger" (click)="acao(pedido.id, 'reprovar')">Reprovar</button>
                        }
                        @if (pedido.status === 'APROVADA') {
                          <button class="btn btn-sm btn-primary" (click)="acao(pedido.id, 'despachar')">Despachar</button>
                        }
                        @if (pedido.status === 'EM_TRANSITO') {
                          <button class="btn btn-sm btn-success" (click)="acao(pedido.id, 'entregar')">Confirmar Entrega</button>
                        }
                      </div>
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
export class GerenciarPedidosComponent {
  private readonly vendaService = inject(VendaService);

  protected pedidos = signal<Venda[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');
  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly STATUS_CORES = STATUS_CORES;

  constructor() {
    this.carregar();
  }

  private carregar() {
    this.vendaService.listarTodas().subscribe({
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

  acao(id: number, acao: string) {
    this.vendaService.atualizarStatus(id, acao).subscribe({
      next: () => this.carregar(),
      error: (err) => this.erro.set(err.message),
    });
  }
}
