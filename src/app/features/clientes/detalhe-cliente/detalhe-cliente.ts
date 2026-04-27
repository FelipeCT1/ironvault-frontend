import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import type { Cliente } from '../../../core/models/cliente.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalhe-cliente',
  standalone: true,
  imports: [RouterLink, LoadingComponent, AlertComponent, StatusBadgeComponent, ModalComponent, FormsModule],
  template: `
    <div class="conteudo">
      @if (carregando()) {
        <app-loading mensagem="Carregando cliente..." />
      } @else if (cliente()) {
        <div class="page-header">
          <div>
            <div class="page-header-label">Cliente #{{ cliente()!.id }}</div>
            <h1>{{ cliente()!.nome }}</h1>
          </div>
          <div style="display: flex; gap: 8px;">
            <a [routerLink]="['/clientes', cliente()!.id, 'editar']" class="btn btn-primary btn-sm">Editar</a>
            <button class="btn btn-danger btn-sm" (click)="confirmarInativacao()">
              {{ cliente()!.ativo ? 'Inativar' : 'Ativar' }}
            </button>
          </div>
        </div>

        <div class="tabs-bar">
          @for (tab of tabs; track tab.key) {
            <button class="tab" [class.active]="abaAtiva() === tab.key" (click)="abaAtiva.set(tab.key)">
              {{ tab.label }}
            </button>
          }
        </div>

        @if (abaAtiva() === 'dados') {
          <div class="card">
            <div class="grid-2">
              <div><span class="rotulo">Nome</span><br/><span>{{ cliente()!.nome }}</span></div>
              <div><span class="rotulo">Gênero</span><br/><span>{{ cliente()!.genero || '-' }}</span></div>
              <div><span class="rotulo">CPF</span><br/><span>{{ cliente()!.cpf }}</span></div>
              <div><span class="rotulo">E-mail</span><br/><span>{{ cliente()!.email }}</span></div>
              <div><span class="rotulo">Telefone</span><br/><span>({{ cliente()!.ddd }}) {{ cliente()!.numeroTelefone }}</span></div>
              <div><span class="rotulo">Status</span><br/><app-status-badge [label]="cliente()!.ativo ? 'Ativo' : 'Inativo'" [cor]="cliente()!.ativo ? 'verde' : 'inativo'" /></div>
            </div>
          </div>
        }

        @if (abaAtiva() === 'enderecos') {
          @if (cliente()!.enderecos?.length) {
            @for (end of cliente()!.enderecos; track end.id) {
              <div class="mini-card">
                <div>
                  <strong>{{ end.apelido }}</strong>
                  <p>{{ end.logradouro }}, {{ end.numero }} - {{ end.bairro }}, {{ end.cidade }}/{{ end.estado }}</p>
                  <div>
                    @if (end.ehEntrega) { <span class="s-verde">Entrega</span> }
                    @if (end.ehCobranca) { <span class="s-azul">Cobrança</span> }
                  </div>
                </div>
              </div>
            }
          } @else {
            <app-alert tipo="info" mensagem="Nenhum endereço cadastrado." />
          }
        }

        @if (abaAtiva() === 'cartoes') {
          @if (cliente()!.cartoes?.length) {
            @for (cartao of cliente()!.cartoes; track cartao.id) {
              <div class="mini-card">
                <div>
                  <strong>{{ cartao.bandeira }}</strong>
                  <p>**** {{ cartao.ultimosDigitos }} | {{ cartao.nomeImpresso }}</p>
                  @if (cartao.preferencial) {
                    <span class="tag-pref">Preferencial</span>
                  }
                </div>
              </div>
            }
          } @else {
            <app-alert tipo="info" mensagem="Nenhum cartão cadastrado." />
          }
        }

        @if (abaAtiva() === 'senha') {
          <div class="card" style="max-width: 400px;">
            <h3 class="card-titulo" style="margin-bottom: 16px;">Alterar Senha</h3>
            <div>
              <div class="campo">
                <label class="rotulo">Nova Senha</label>
                <input class="form-control" type="password" [(ngModel)]="novaSenha" placeholder="Mín. 8 caracteres" />
              </div>
              <div class="campo">
                <label class="rotulo">Confirmar Nova Senha</label>
                <input class="form-control" type="password" [(ngModel)]="confirmacaoSenha" placeholder="Repita a senha" />
              </div>
              @if (erroSenha()) {
                <app-alert tipo="danger" [mensagem]="erroSenha()" />
              }
              <button class="btn btn-primary" (click)="alterarSenha()" [disabled]="!novaSenha || novaSenha !== confirmacaoSenha">Alterar Senha</button>
            </div>
          </div>
        }
      } @else {
        <app-alert tipo="danger" mensagem="Cliente não encontrado." />
      }
    </div>

    <app-modal [aberto]="modalAberto()" [mostrarFooter]="true" titulo="Confirmação" (fechar)="modalAberto.set(false)">
      <p>Tem certeza que deseja {{ cliente()?.ativo !== false ? 'inativar' : 'ativar' }} este cliente?</p>
      <div modal-footer>
        <button class="btn btn-secondary" (click)="modalAberto.set(false)">Cancelar</button>
        <button class="btn btn-danger" (click)="toggleStatus()">Confirmar</button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheClienteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly clienteService = inject(ClienteService);

  protected cliente = signal<Cliente | null>(null);
  protected carregando = signal(true);
  protected erro = signal('');
  protected abaAtiva = signal('dados');
  protected modalAberto = signal(false);
  protected novaSenha = '';
  protected confirmacaoSenha = '';
  protected erroSenha = signal('');

  protected tabs = [
    { key: 'dados', label: 'Dados' },
    { key: 'enderecos', label: 'Endereços' },
    { key: 'cartoes', label: 'Cartões' },
    { key: 'senha', label: 'Alterar Senha' },
  ];

  constructor() {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.clienteService.buscarPorId(id).subscribe({
        next: (cliente) => {
          this.cliente.set(cliente);
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(err.message);
          this.carregando.set(false);
        },
      });
    }
  }

  confirmarInativacao() {
    this.modalAberto.set(true);
  }

  toggleStatus() {
    const c = this.cliente();
    if (!c?.id) return;
    (c.ativo ? this.clienteService.inativar(c.id) : this.clienteService.ativar(c.id)).subscribe({
      next: () => {
        this.modalAberto.set(false);
        this.clienteService.buscarPorId(c.id!).subscribe((updated) => this.cliente.set(updated));
      },
    });
  }

  alterarSenha() {
    const c = this.cliente();
    if (!c?.id || !this.novaSenha || this.novaSenha !== this.confirmacaoSenha) return;
    this.erroSenha.set('');
    this.clienteService.alterarSenha(c.id, { novaSenha: this.novaSenha, confirmacaoSenha: this.confirmacaoSenha }).subscribe({
      next: () => {
        this.novaSenha = '';
        this.confirmacaoSenha = '';
        this.erroSenha.set('');
      },
      error: (err) => this.erroSenha.set(err.message),
    });
  }
}
