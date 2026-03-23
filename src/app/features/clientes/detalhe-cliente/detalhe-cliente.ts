import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';

import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.model';

function senhasIguais(group: AbstractControl) {
  const n = group.get('novaSenha')?.value;
  const c = group.get('confirmacaoSenha')?.value;
  return n && c && n !== c ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-detalhe-cliente',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-wrapper" style="max-width:1100px">

      <div class="page-header">
        <div>
          <div class="page-header__rotulo">RF0022 – RF0028</div>
          <h1 class="page-header__titulo">
            {{ cliente()?.nome ?? 'Carregando…' }}
          </h1>
          <p class="page-header__sub">
            CLI-{{ id?.padStart(4,'0') }} ·
            @if (cliente()?.ativo) {
              <span style="color:var(--verde)">● Ativo</span>
            } @else {
              <span style="color:var(--mudo)">● Inativo</span>
            }
          </p>
        </div>
        <div class="page-header__actions">
          <a routerLink="/clientes" class="btn btn--ghost">← Voltar</a>
          @if (cliente()?.id) {
            <a [routerLink]="['/clientes', cliente()!.id, 'editar']" class="btn btn--secondary">
              ✏️ Editar
            </a>
            @if (cliente()?.ativo) {
              <button (click)="modalInativar.set(true)" class="btn btn--danger">⛔ Inativar</button>
            }
          }
        </div>
      </div>

      @if (erro())    { <div class="alert alert--danger">⚠️ {{ erro() }}</div> }
      @if (sucesso()) { <div class="alert alert--success">✅ {{ sucesso() }}</div> }

      @if (carregando()) {
        <div class="loading-state">
          <span class="spinner"></span> Carregando…
        </div>
      }

      @if (cliente() && !carregando()) {

        <div class="tabs">
          <button class="tabs__item" [class.tabs__item--ativo]="aba() === 'dados'"
            (click)="aba.set('dados')">📋 Dados</button>
          <button class="tabs__item" [class.tabs__item--ativo]="aba() === 'enderecos'"
            (click)="aba.set('enderecos')">
            📍 Endereços ({{ cliente()!.enderecos?.length ?? 0 }})
          </button>
          <button class="tabs__item" [class.tabs__item--ativo]="aba() === 'cartoes'"
            (click)="aba.set('cartoes')">
            💳 Cartões ({{ cliente()!.cartoes?.length ?? 0 }})
          </button>
          <button class="tabs__item" [class.tabs__item--ativo]="aba() === 'senha'"
            (click)="aba.set('senha')">🔑 Alterar Senha</button>
        </div>

        <!-- ABA: Dados -->
        @if (aba() === 'dados') {
          <div class="grid-2">
            <div class="card">
              <div class="card__header"><span class="card__titulo">Dados Pessoais</span></div>
              <dl class="dl-info">
                <dt>Nome</dt>          <dd>{{ cliente()!.nome }}</dd>
                <dt>CPF</dt>           <dd>{{ cliente()!.cpf }}</dd>
                <dt>E-mail</dt>        <dd>{{ cliente()!.email }}</dd>
                <dt>Nascimento</dt>    <dd>{{ formatarData(cliente()!.dataNascimento) }}</dd>
                <dt>Gênero</dt>        <dd>{{ cliente()!.genero }}</dd>
                <dt>Telefone</dt>      <dd>({{ cliente()!.ddd }}) {{ cliente()!.numeroTelefone }} — {{ cliente()!.tipoTelefone }}</dd>
                <dt>Ranking</dt>       <dd>⭐ {{ cliente()!.ranking ?? 0 }}</dd>
              </dl>
            </div>
            <div class="card">
              <div class="card__header"><span class="card__titulo">Resumo</span></div>
              <div class="grid-2" style="gap:12px">
                <div class="stat-card stat-card--verde">
                  <div class="stat-card__rotulo">Endereços</div>
                  <div class="stat-card__valor">{{ cliente()!.enderecos?.length ?? 0 }}</div>
                </div>
                <div class="stat-card stat-card--azul">
                  <div class="stat-card__rotulo">Cartões</div>
                  <div class="stat-card__valor">{{ cliente()!.cartoes?.length ?? 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ABA: Endereços -->
        @if (aba() === 'enderecos') {
          @if (!cliente()!.enderecos?.length) {
            <div class="empty-state">
              <div class="empty-state__icon">📍</div>
              <div class="empty-state__title">Sem endereços</div>
              <div class="empty-state__sub">Edite o cadastro para adicionar endereços.</div>
            </div>
          } @else {
            <div style="display:flex; flex-direction:column; gap:10px">
              @for (end of cliente()!.enderecos; track end.id) {
                <div class="mini-card" [class.mini-card--preferencial]="end.ehEntrega">
                  <div class="mini-card__info">
                    <strong>
                      {{ end.apelido }}
                      @if (end.ehEntrega)  { <span class="tag-pref">Entrega</span> }
                      @if (end.ehCobranca) {
                        <span class="tag-pref" style="background:rgba(59,130,246,.15);color:var(--azul)">
                          Cobrança
                        </span>
                      }
                    </strong>
                    <p>
                      {{ end.tipoLogradouro }} {{ end.logradouro }}, {{ end.numero }}<br>
                      {{ end.bairro }} · {{ end.cidade }} / {{ end.estado }}<br>
                      CEP {{ end.cep }} · {{ end.pais }}
                      @if (end.observacoes) { <br>{{ end.observacoes }} }
                    </p>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- ABA: Cartões -->
        @if (aba() === 'cartoes') {
          @if (!cliente()!.cartoes?.length) {
            <div class="empty-state">
              <div class="empty-state__icon">💳</div>
              <div class="empty-state__title">Sem cartões</div>
              <div class="empty-state__sub">Edite o cadastro para adicionar cartões.</div>
            </div>
          } @else {
            <div style="display:flex; flex-direction:column; gap:10px">
              @for (cartao of cliente()!.cartoes; track cartao.id) {
                <div class="mini-card" [class.mini-card--preferencial]="cartao.preferencial">
                  <div class="mini-card__info">
                    <strong>
                      💳 {{ cartao.bandeira }} · **** {{ cartao.numero.slice(-4) }}
                      @if (cartao.preferencial) { <span class="tag-pref">Preferencial</span> }
                    </strong>
                    <p>{{ cartao.nomeImpresso }}</p>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- ABA: Alterar Senha -->
        @if (aba() === 'senha') {
          <div style="max-width:480px">
            <div class="card">
              <div class="card__header"><span class="card__titulo">Alterar Senha (RF0028)</span></div>
              <div class="alert alert--info" style="margin-bottom:14px">
                🔒 Mínimo 8 caracteres, com maiúsculas, minúsculas e caractere especial.
              </div>
              <form [formGroup]="formSenha" (ngSubmit)="alterarSenha()">
                <div class="form-group">
                  <label>Nova Senha *</label>
                  <input formControlName="novaSenha" type="password" placeholder="••••••••" />
                  @if (formSenha.get('novaSenha')?.invalid && formSenha.get('novaSenha')?.touched) {
                    <span class="erro">Mínimo 8 caracteres.</span>
                  }
                </div>
                <div class="form-group">
                  <label>Confirmar Nova Senha *</label>
                  <input formControlName="confirmacaoSenha" type="password" placeholder="••••••••" />
                  @if (formSenha.errors?.['senhasDiferentes'] && formSenha.get('confirmacaoSenha')?.touched) {
                    <span class="erro">As senhas não conferem.</span>
                  }
                </div>
                <button type="submit" class="btn btn--primary" [disabled]="salvandoSenha()">
                  @if (salvandoSenha()) {
                    <span class="spinner" style="width:13px;height:13px;border-top-color:var(--preto)"></span>
                    Salvando…
                  } @else {
                    🔑 Atualizar Senha
                  }
                </button>
              </form>
            </div>
          </div>
        }

      }

      <!-- Modal inativação -->
      @if (modalInativar()) {
        <div class="modal-overlay" (click)="modalInativar.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal__header">
              <h3>⛔ Inativar Cliente</h3>
              <button class="btn-close" (click)="modalInativar.set(false)">✕</button>
            </div>
            <div class="modal__body">
              <p style="font-size:.9rem; line-height:1.7">
                Confirmar inativação de <strong>{{ cliente()?.nome }}</strong>?
              </p>
            </div>
            <div class="modal__footer">
              <button (click)="modalInativar.set(false)" class="btn btn--ghost">Cancelar</button>
              <button (click)="inativar()" class="btn btn--danger">⛔ Inativar</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .dl-info {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 6px 16px;
      font-size: .85rem;
    }
    .dl-info dt {
      color: var(--mudo);
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding-top: 2px;
    }
    .dl-info dd { color: var(--branco); }
    .btn-close { background: none; border: none; color: var(--mudo); font-size: 1.2rem; cursor: pointer; }
  `]
})
export class DetalheClienteComponent implements OnInit {
  @Input() id?: string;

  private readonly service = inject(ClienteService);
  private readonly fb      = inject(FormBuilder);

  aba           = signal<'dados' | 'enderecos' | 'cartoes' | 'senha'>('dados');
  cliente       = signal<Cliente | null>(null);
  carregando    = signal(true);
  erro          = signal('');
  sucesso       = signal('');
  salvandoSenha = signal(false);
  modalInativar = signal(false);

  formSenha!: FormGroup;

  ngOnInit(): void {
    this.formSenha = this.fb.group({
      novaSenha:        ['', [Validators.required, Validators.minLength(8)]],
      confirmacaoSenha: ['', Validators.required],
    }, { validators: senhasIguais });

    this.service.listarTodos().subscribe({
      next: (lista) => {
        const c = lista.find((x) => x.id === Number(this.id)) ?? null;
        this.cliente.set(c);
        this.carregando.set(false);
        if (!c) this.erro.set('Cliente não encontrado.');
      },
      error: (e) => { this.erro.set(e.message); this.carregando.set(false); },
    });
  }

  alterarSenha(): void {
    if (this.formSenha.invalid) { this.formSenha.markAllAsTouched(); return; }
    this.salvandoSenha.set(true);
    this.service.alterarSenha(Number(this.id), this.formSenha.value).subscribe({
      next: () => {
        this.salvandoSenha.set(false);
        this.sucesso.set('Senha alterada com sucesso!');
        this.formSenha.reset();
        setTimeout(() => this.sucesso.set(''), 4000);
      },
      error: (e) => { this.salvandoSenha.set(false); this.erro.set(e.message); },
    });
  }

  inativar(): void {
    this.service.inativar(Number(this.id)).subscribe({
      next: () => {
        this.modalInativar.set(false);
        this.cliente.update((c) => c ? { ...c, ativo: false } : c);
        this.sucesso.set('Cliente inativado.');
        setTimeout(() => this.sucesso.set(''), 4000);
      },
      error: (e) => { this.modalInativar.set(false); this.erro.set(e.message); },
    });
  }

  formatarData(d?: string): string {
    if (!d) return '—';
    const [y, m, dia] = d.split('-');
    return `${dia}/${m}/${y}`;
  }
}