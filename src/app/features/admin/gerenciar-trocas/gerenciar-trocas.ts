import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TrocaService } from '../../../core/services/troca.service';
import type { Troca } from '../../../core/models/troca.model';
import { STATUS_TROCA_LABELS, STATUS_TROCA_CORES } from '../../../core/models/troca.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { AlertComponent } from '../../../shared/components/alert/alert';

@Component({
  selector: 'app-gerenciar-trocas',
  standalone: true,
  imports: [DatePipe, LoadingComponent, AlertComponent],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Admin</div>
          <h1>Gerenciar Trocas</h1>
        </div>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando trocas..." />
      } @else {
        <div class="card">
          <div class="tabela-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Produto</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (troca of trocas(); track troca.id) {
                  <tr>
                    <td>{{ troca.codigoTroca }}</td>
                    <td>{{ troca.produtoNome }}</td>
                    <td>#{{ troca.clienteId }}</td>
                    <td>
                      <span class="status s-{{ STATUS_TROCA_CORES[troca.status] }}">
                        {{ STATUS_TROCA_LABELS[troca.status] }}
                      </span>
                    </td>
                    <td>{{ troca.dataCriacao | date:'shortDate' }}</td>
                    <td>
                      <div>
                        @if (troca.status === 'SOLICITADA') {
                          <button class="btn btn-sm btn-purple" (click)="acao(troca.id, 'autorizar')">Autorizar</button>
                          <button class="btn btn-sm btn-danger" (click)="acao(troca.id, 'recusar')">Recusar</button>
                        }
                        @if (troca.status === 'AUTORIZADA') {
                          <button class="btn btn-sm btn-purple" (click)="acao(troca.id, 'concluir')">Confirmar Recebimento</button>
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
export class GerenciarTrocasComponent {
  private readonly trocaService = inject(TrocaService);

  protected trocas = signal<Troca[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');
  protected readonly STATUS_TROCA_LABELS = STATUS_TROCA_LABELS;
  protected readonly STATUS_TROCA_CORES = STATUS_TROCA_CORES;

  constructor() {
    this.carregar();
  }

  private carregar() {
    this.trocaService.listarTodas().subscribe({
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

  acao(id: number, acao: string) {
    const obs = acao === 'autorizar'
      ? this.trocaService.autorizar(id)
      : acao === 'recusar'
        ? this.trocaService.recusar(id)
        : this.trocaService.concluir(id);

    obs.subscribe({
      next: () => this.carregar(),
      error: (err) => this.erro.set(err.message),
    });
  }
}
