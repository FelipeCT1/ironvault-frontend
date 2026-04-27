import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrocaService } from '../../../core/services/troca.service';
import { AuthService } from '../../../core/services/auth.service';
import type { Troca } from '../../../core/models/troca.model';
import { STATUS_TROCA_LABELS, STATUS_TROCA_CORES } from '../../../core/models/troca.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-lista-trocas',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, LoadingComponent, EmptyStateComponent, AlertComponent, StatusBadgeComponent],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Trocas</div>
          <h1>Minhas Trocas</h1>
        </div>
        <a routerLink="/trocas/nova" class="btn btn-purple btn-sm">+ Solicitar Troca</a>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando trocas..." />
      } @else if (trocas().length === 0) {
        <app-empty-state icone="🔄" titulo="Nenhuma troca encontrada" sub="Você ainda não solicitou nenhuma troca" />
      } @else {
        <div class="card">
          <div class="tabela-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor Crédito</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                @for (troca of trocas(); track troca.id) {
                  <tr>
                    <td>{{ troca.codigoTroca }}</td>
                    <td>{{ troca.produtoNome }}</td>
                    <td>{{ troca.quantidade }}</td>
                    <td>{{ troca.valorCredito | currency:'BRL' }}</td>
                    <td>
                      <app-status-badge [label]="STATUS_TROCA_LABELS[troca.status]" [cor]="STATUS_TROCA_CORES[troca.status]" />
                    </td>
                    <td>{{ troca.dataCriacao | date:'shortDate' }}</td>
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
export class ListaTrocasComponent {
  private readonly trocaService = inject(TrocaService);
  private readonly auth = inject(AuthService);

  protected trocas = signal<Troca[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');
  protected readonly STATUS_TROCA_LABELS = STATUS_TROCA_LABELS;
  protected readonly STATUS_TROCA_CORES = STATUS_TROCA_CORES;

  constructor() {
    const clienteId = this.auth['_clienteAtual']()?.id;
    if (clienteId) {
      this.trocaService.listarPorCliente(clienteId).subscribe({
        next: (trocas) => {
          this.trocas.set(trocas);
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
