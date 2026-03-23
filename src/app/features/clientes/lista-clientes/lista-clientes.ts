import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="page-wrapper">

      <div class="page-header">
        <div>
          <div class="page-header__rotulo">RF0021 – RF0024</div>
          <h1 class="page-header__titulo">Clientes</h1>
          <p class="page-header__sub">
            {{ totalAtivos() }} ativos · {{ totalInativos() }} inativos
          </p>
        </div>
        <div class="page-header__actions">
          <a routerLink="/clientes/novo" class="btn btn--primary">+ Novo Cliente</a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom: 20px">
        <div class="form-row form-row--3">
          <div class="form-group" style="margin-bottom:0">
            <label>Nome</label>
            <input [formControl]="filtroNome" type="text" placeholder="Nome do cliente…" />
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>CPF</label>
            <input [formControl]="filtroCpf" type="text" placeholder="000.000.000-00" />
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>E-mail</label>
            <input [formControl]="filtroEmail" type="email" placeholder="email@exemplo.com" />
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:14px; align-items:center; flex-wrap:wrap">
          <button (click)="buscar()" class="btn btn--secondary">🔍 Buscar</button>
          <button (click)="limparFiltros()" class="btn btn--ghost btn--sm">Limpar</button>
          <div style="margin-left:auto; display:flex; gap:6px">
            <button (click)="filtroStatus.set('todos')"
              [class.btn--primary]="filtroStatus() === 'todos'"
              [class.btn--ghost]="filtroStatus() !== 'todos'"
              class="btn btn--sm">Todos</button>
            <button (click)="filtroStatus.set('ativo')"
              [class.btn--success]="filtroStatus() === 'ativo'"
              [class.btn--ghost]="filtroStatus() !== 'ativo'"
              class="btn btn--sm">Ativos</button>
            <button (click)="filtroStatus.set('inativo')"
              [class.btn--danger]="filtroStatus() === 'inativo'"
              [class.btn--ghost]="filtroStatus() !== 'inativo'"
              class="btn btn--sm">Inativos</button>
          </div>
        </div>
      </div>

      @if (erro()) {
        <div class="alert alert--danger">⚠️ {{ erro() }}</div>
      }
      @if (sucessoMsg()) {
        <div class="alert alert--success">✅ {{ sucessoMsg() }}</div>
      }

      <!-- Tabela -->
      <div class="card">
        @if (carregando()) {
          <div class="loading-state">
            <span class="spinner"></span> Carregando clientes…
          </div>
        } @else if (clientesFiltrados().length === 0) {
          <div class="empty-state">
            <div class="empty-state__icon">👤</div>
            <div class="empty-state__title">Nenhum cliente encontrado</div>
            <div class="empty-state__sub">Ajuste os filtros ou cadastre um novo cliente.</div>
          </div>
        } @else {
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
                @for (cliente of clientesFiltrados(); track cliente.id) {
                  <tr>
                    <td>
                      <span style="color:var(--mudo); font-size:.75rem; font-weight:700">
                        CLI-{{ cliente.id | number:'4.0-0' }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:8px">
                        <div class="avatar">{{ iniciais(cliente.nome) }}</div>
                        {{ cliente.nome }}
                      </div>
                    </td>
                    <td style="font-family:monospace; font-size:.8rem">{{ cliente.cpf }}</td>
                    <td>{{ cliente.email }}</td>
                    <td>({{ cliente.ddd }}) {{ cliente.numeroTelefone }}</td>
                    <td>
                      <span class="status"
                        [class.status--ativo]="cliente.ativo"
                        [class.status--inativo]="!cliente.ativo">
                        {{ cliente.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex; gap:6px">
                        <a [routerLink]="['/clientes', cliente.id]" class="btn btn--ghost btn--sm">
                          👁 Ver
                        </a>
                        <a [routerLink]="['/clientes', cliente.id, 'editar']" class="btn btn--secondary btn--sm">
                          ✏️ Editar
                        </a>
                        @if (cliente.ativo) {
                          <button (click)="confirmarInativar(cliente)"
                            class="btn btn--danger btn--sm"
                            [disabled]="inativando() === cliente.id">
                            @if (inativando() === cliente.id) {
                              <span class="spinner" style="width:12px;height:12px"></span>
                            } @else {
                              ⛔ Inativar
                            }
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div style="padding:12px 14px; border-top:1px solid var(--borda); font-size:.75rem; color:var(--mudo)">
            {{ clientesFiltrados().length }} resultado(s)
          </div>
        }
      </div>

      <!-- Modal confirmação inativação -->
      @if (clienteParaInativar()) {
        <div class="modal-overlay" (click)="cancelarInativar()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal__header">
              <h3>⛔ Inativar Cliente</h3>
              <button class="btn-close" (click)="cancelarInativar()">✕</button>
            </div>
            <div class="modal__body">
              <p style="font-size:.9rem; line-height:1.7">
                Confirmar inativação de <strong>{{ clienteParaInativar()?.nome }}</strong>?
                <br><span style="color:var(--mudo); font-size:.82rem">Esta ação pode ser revertida pelo administrador.</span>
              </p>
            </div>
            <div class="modal__footer">
              <button (click)="cancelarInativar()" class="btn btn--ghost">Cancelar</button>
              <button (click)="executarInativar()" class="btn btn--danger">⛔ Confirmar</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .btn-close { background: none; border: none; color: var(--mudo); font-size: 1.2rem; cursor: pointer; }
  `]
})
export class ListaClientesComponent implements OnInit {
  private readonly service = inject(ClienteService);

  clientes             = signal<Cliente[]>([]);
  carregando           = signal(false);
  erro                 = signal('');
  sucessoMsg           = signal('');
  inativando           = signal<number | null>(null);
  filtroStatus         = signal<'todos' | 'ativo' | 'inativo'>('todos');
  clienteParaInativar  = signal<Cliente | null>(null);

  filtroNome  = new FormControl('');
  filtroCpf   = new FormControl('');
  filtroEmail = new FormControl('');

  clientesFiltrados = computed(() => {
    const status = this.filtroStatus();
    return this.clientes().filter((c) =>
      status === 'todos' ? true : status === 'ativo' ? !!c.ativo : !c.ativo
    );
  });

  totalAtivos   = computed(() => this.clientes().filter((c) =>  c.ativo).length);
  totalInativos = computed(() => this.clientes().filter((c) => !c.ativo).length);

  ngOnInit(): void { this.carregarTodos(); }

  carregarTodos(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.service.listarTodos().subscribe({
      next: (data) => { this.clientes.set(data); this.carregando.set(false); },
      error: (e)   => { this.erro.set(e.message); this.carregando.set(false); },
    });
  }

  buscar(): void {
    const nome  = this.filtroNome.value?.trim()  || undefined;
    const cpf   = this.filtroCpf.value?.trim()   || undefined;
    const email = this.filtroEmail.value?.trim()  || undefined;

    if (!nome && !cpf && !email) { this.carregarTodos(); return; }

    this.carregando.set(true);
    this.service.buscar({ nome, cpf, email }).subscribe({
      next: (data) => { this.clientes.set(data); this.carregando.set(false); },
      error: (e)   => { this.erro.set(e.message); this.carregando.set(false); },
    });
  }

  limparFiltros(): void {
    this.filtroNome.reset();
    this.filtroCpf.reset();
    this.filtroEmail.reset();
    this.filtroStatus.set('todos');
    this.carregarTodos();
  }

  confirmarInativar(cliente: Cliente): void { this.clienteParaInativar.set(cliente); }
  cancelarInativar(): void { this.clienteParaInativar.set(null); }

  executarInativar(): void {
    const cliente = this.clienteParaInativar();
    if (!cliente?.id) return;

    this.inativando.set(cliente.id);
    this.clienteParaInativar.set(null);

    this.service.inativar(cliente.id).subscribe({
      next: () => {
        this.inativando.set(null);
        this.clientes.update((lista) =>
          lista.map((c) => c.id === cliente.id ? { ...c, ativo: false } : c)
        );
        this.sucessoMsg.set(`"${cliente.nome}" inativado com sucesso.`);
        setTimeout(() => this.sucessoMsg.set(''), 4000);
      },
      error: (e) => { this.inativando.set(null); this.erro.set(e.message); },
    });
  }

  iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  }
}