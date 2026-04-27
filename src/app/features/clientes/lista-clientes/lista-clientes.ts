import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import type { Cliente } from '../../../core/models/cliente.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [RouterLink, LoadingComponent, EmptyStateComponent, AlertComponent, StatusBadgeComponent, ModalComponent, FormsModule],
  template: `
    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="page-header-label">Gestão</div>
          <h1>Clientes</h1>
          <p class="page-header-sub">Gerencie os clientes cadastrados</p>
        </div>
        <a routerLink="/clientes/novo" class="btn btn-primary">+ Novo Cliente</a>
      </div>

      <div class="search-bar">
        <input class="form-control" placeholder="Nome..." [(ngModel)]="filtroNome" />
        <input class="form-control" placeholder="CPF..." [(ngModel)]="filtroCpf" />
        <input class="form-control" placeholder="E-mail..." [(ngModel)]="filtroEmail" />
        <button class="btn btn-primary btn-sm" (click)="buscar()">Buscar</button>
        <button class="btn btn-secondary btn-sm" (click)="limparFiltros()">Limpar</button>
        <div style="display: flex; gap: 4px; align-items: center; margin-left: 8px;">
          <button class="btn btn-sm" [class.btn-primary]="filtroAtivo === 'todos'" (click)="filtroAtivo = 'todos'; carregar()">Todos</button>
          <button class="btn btn-sm" [class.btn-primary]="filtroAtivo === 'ativos'" (click)="filtroAtivo = 'ativos'; carregar()">Ativos</button>
          <button class="btn btn-sm" [class.btn-primary]="filtroAtivo === 'inativos'" (click)="filtroAtivo = 'inativos'; carregar()">Inativos</button>
        </div>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando clientes..." />
      } @else if (clientes().length === 0) {
        <app-empty-state icone="👤" titulo="Nenhum cliente encontrado" sub="Cadastre o primeiro cliente" />
      } @else {
        <div class="card">
          <div class="tabela-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (cliente of clientes(); track cliente.id) {
                  <tr>
                    <td>#{{ cliente.id }}</td>
                    <td>
                      <div class="avatar">{{ cliente.nome.charAt(0) }}{{ cliente.nome.split(' ')[1]?.charAt(0) ?? '' }}</div>
                      <span>{{ cliente.nome }}</span>
                    </td>
                    <td>{{ cliente.cpf }}</td>
                    <td>{{ cliente.email }}</td>
                    <td>({{ cliente.ddd }}) {{ cliente.numeroTelefone }}</td>
                    <td>
                      <app-status-badge [label]="cliente.ativo ? 'Ativo' : 'Inativo'" [cor]="cliente.ativo ? 'verde' : 'inativo'" />
                    </td>
                    <td>
                      <a [routerLink]="['/clientes', cliente.id]" class="btn btn-blue btn-sm">Ver</a>
                      <a [routerLink]="['/clientes', cliente.id, 'editar']" class="btn btn-blue btn-sm">Editar</a>
                      <button class="btn btn-danger btn-sm" (click)="confirmarInativacao(cliente)">
                        {{ cliente.ativo ? 'Inativar' : 'Ativar' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <app-modal [aberto]="modalAberto()" titulo="Confirmação" (fechar)="modalAberto.set(false)">
      <p>Tem certeza que deseja {{ clienteSelecionado?.ativo !== false ? 'inativar' : 'ativar' }} o cliente <strong>{{ clienteSelecionado?.nome }}</strong>?</p>
      <div modal-footer>
        <button class="btn btn-secondary" (click)="modalAberto.set(false)">Cancelar</button>
        <button class="btn btn-danger" (click)="toggleStatus()">Confirmar</button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaClientesComponent {
  private readonly clienteService = inject(ClienteService);

  protected clientes = signal<Cliente[]>([]);
  protected carregando = signal(true);
  protected erro = signal('');
  protected filtroNome = '';
  protected filtroCpf = '';
  protected filtroEmail = '';
  protected filtroAtivo = 'todos';
  protected modalAberto = signal(false);
  protected clienteSelecionado: Cliente | null = null;

  constructor() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.clienteService.listarTodos().subscribe({
      next: (clientes) => {
        let lista = clientes;
        if (this.filtroAtivo === 'ativos') lista = lista.filter((c) => c.ativo);
        if (this.filtroAtivo === 'inativos') lista = lista.filter((c) => !c.ativo);
        this.clientes.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  buscar() {
    this.carregando.set(true);
    this.erro.set('');
    this.clienteService.buscar({ nome: this.filtroNome, cpf: this.filtroCpf, email: this.filtroEmail }).subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  limparFiltros() {
    this.filtroNome = '';
    this.filtroCpf = '';
    this.filtroEmail = '';
    this.carregar();
  }

  confirmarInativacao(cliente: Cliente) {
    this.clienteSelecionado = cliente;
    this.modalAberto.set(true);
  }

  toggleStatus() {
    if (!this.clienteSelecionado?.id) return;
    const id = this.clienteSelecionado.id;
    const ativo = this.clienteSelecionado.ativo;

    (ativo ? this.clienteService.inativar(id) : this.clienteService.ativar(id)).subscribe({
      next: () => {
        this.modalAberto.set(false);
        this.carregar();
      },
    });
  }
}
