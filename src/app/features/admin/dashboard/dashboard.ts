import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { VendaService } from '../../../core/services/venda.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { TrocaService } from '../../../core/services/troca.service';
import type { Venda } from '../../../core/models/venda.model';
import { STATUS_LABELS, STATUS_CORES } from '../../../core/models/venda.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LoadingComponent],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Admin</div>
          <h1>Dashboard</h1>
        </div>
      </div>

      @if (carregando()) {
        <app-loading mensagem="Carregando dashboard..." />
      } @else {
        <div class="grid-4">
          <div class="stat-card verde">
            <div class="stat-rotulo">Vendas Hoje</div>
            <div class="stat-valor">{{ vendasHoje() }}</div>
          </div>
          <div class="stat-card azul">
            <div class="stat-rotulo">Pedidos Ativos</div>
            <div class="stat-valor">{{ pedidosAtivos() }}</div>
          </div>
          <div class="stat-card laranja">
            <div class="stat-rotulo">Clientes Ativos</div>
            <div class="stat-valor">{{ totalClientes() }}</div>
          </div>
          <div class="stat-card roxo">
            <div class="stat-rotulo">Trocas Pendentes</div>
            <div class="stat-valor">{{ trocasPendentes() }}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-titulo">Pedidos Recentes</span>
            <a routerLink="/admin/pedidos" class="btn btn-sm btn-secondary">Ver Todos</a>
          </div>
          <div class="tabela-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (pedido of pedidosRecentes(); track pedido.id) {
                  <tr>
                    <td>{{ pedido.codigoPedido }}</td>
                    <td>{{ pedido.clienteNome }}</td>
                    <td>{{ pedido.total | currency:'BRL':'symbol':'1.2-2' }}</td>
                    <td>
                      <span class="status s-{{ STATUS_CORES[pedido.status] }}">
                        {{ STATUS_LABELS[pedido.status] }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <a routerLink="/admin/pedidos" class="btn btn-primary">Gerenciar Pedidos</a>
          <a routerLink="/admin/trocas" class="btn btn-secondary">Gerenciar Trocas</a>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly vendaService = inject(VendaService);
  private readonly clienteService = inject(ClienteService);
  private readonly trocaService = inject(TrocaService);

  protected carregando = signal(true);
  protected vendasHoje = signal(0);
  protected pedidosAtivos = signal(0);
  protected totalClientes = signal(0);
  protected trocasPendentes = signal(0);
  protected pedidosRecentes = signal<Venda[]>([]);
  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly STATUS_CORES = STATUS_CORES;

  constructor() {
    this.vendaService.listarTodas().subscribe({
      next: (vendas) => {
        const hoje = new Date().toISOString().slice(0, 10);
        this.vendasHoje.set(vendas.filter((v) => v.dataCriacao?.startsWith(hoje)).length);
        this.pedidosAtivos.set(vendas.filter((v) => v.status === 'EM_PROCESSAMENTO' || v.status === 'APROVADA' || v.status === 'EM_TRANSITO').length);
        this.pedidosRecentes.set(vendas.slice(0, 5));
      },
    });

    this.clienteService.listarTodos().subscribe({
      next: (clientes) => this.totalClientes.set(clientes.filter((c) => c.ativo).length),
    });

    this.trocaService.listarTodas().subscribe({
      next: (trocas) => {
        this.trocasPendentes.set(trocas.filter((t) => t.status === 'SOLICITADA').length);
        this.carregando.set(false);
      },
    });
  }
}
