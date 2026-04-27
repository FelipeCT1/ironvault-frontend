import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TrocaService } from '../../../core/services/troca.service';
import { VendaService } from '../../../core/services/venda.service';
import { AuthService } from '../../../core/services/auth.service';
import type { Venda } from '../../../core/models/venda.model';
import type { ItemVenda } from '../../../core/models/venda.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { AlertComponent } from '../../../shared/components/alert/alert';

@Component({
  selector: 'app-solicitar-troca',
  standalone: true,
  imports: [FormsModule, DatePipe, LoadingComponent, AlertComponent],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Trocas</div>
          <h1>Solicitar Troca</h1>
        </div>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando..." />
      } @else {
        <div class="card">
          <div class="campo">
            <label>Pedido</label>
            <select class="form-control" [(ngModel)]="pedidoSelecionado" (ngModelChange)="onPedidoChange()">
              <option value="">Selecione um pedido</option>
              @for (pedido of pedidosEntregues(); track pedido.id) {
                <option [value]="pedido.id">{{ pedido.codigoPedido }} - {{ pedido.dataCriacao | date:'shortDate' }}</option>
              }
            </select>
          </div>

          @if (pedidoSelecionado) {
            <div class="campo">
              <label>Produto</label>
              <select class="form-control" [(ngModel)]="produtoSelecionado">
                <option value="">Selecione um produto</option>
                @for (item of itensDisponiveis(); track item.produtoId) {
                  <option [value]="item.produtoId">{{ item.produtoNome }}</option>
                }
              </select>
            </div>
          }

          @if (produtoSelecionado) {
            <div class="campo">
              <label>Quantidade</label>
              <input class="form-control" type="number" min="1" [(ngModel)]="quantidade" />
            </div>

            <div class="campo">
              <label>Valor de Crédito (R$)</label>
              <input class="form-control" type="number" min="0" step="0.01" [(ngModel)]="valorCredito" />
            </div>

            <div class="campo">
              <label>Motivo</label>
              <textarea class="form-control" rows="3" [(ngModel)]="motivo" placeholder="Descreva o motivo da troca..."></textarea>
            </div>

            <button class="btn btn-primary" (click)="solicitar()" [disabled]="salvando()">
              {{ salvando() ? 'Solicitando...' : 'Solicitar Troca' }}
            </button>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitarTrocaComponent {
  private readonly trocaService = inject(TrocaService);
  private readonly vendaService = inject(VendaService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected pedidosEntregues = signal<Venda[]>([]);
  protected itensDisponiveis = signal<ItemVenda[]>([]);
  protected carregando = signal(true);
  protected salvando = signal(false);
  protected erro = signal('');
  protected pedidoSelecionado = 0;
  protected produtoSelecionado = 0;
  protected quantidade = 1;
  protected valorCredito = 0;
  protected motivo = '';

  constructor() {
    const clienteId = this.auth['_clienteAtual']()?.id;
    if (clienteId) {
      this.vendaService.listarPorCliente(clienteId).subscribe({
        next: (vendas) => {
          this.pedidosEntregues.set(vendas.filter((v) => v.status === 'ENTREGUE'));
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
    }
  }

  onPedidoChange() {
    const pedido = this.pedidosEntregues().find((p) => p.id === this.pedidoSelecionado);
    this.itensDisponiveis.set(pedido?.itens ?? []);
    this.produtoSelecionado = 0;
  }

  solicitar() {
    if (!this.pedidoSelecionado || !this.produtoSelecionado || !this.motivo) return;

    const item = this.itensDisponiveis().find((i) => i.produtoId === this.produtoSelecionado);
    if (!item) return;

    this.salvando.set(true);
    this.erro.set('');

    this.trocaService
      .solicitar({
        vendaId: this.pedidoSelecionado,
        produtoId: this.produtoSelecionado,
        produtoNome: item.produtoNome,
        quantidade: this.quantidade,
        motivo: this.motivo,
        valorCredito: this.valorCredito,
      })
      .subscribe({
        next: () => this.router.navigate(['/trocas']),
        error: (err) => {
          this.erro.set(err.message);
          this.salvando.set(false);
        },
      });
  }
}
