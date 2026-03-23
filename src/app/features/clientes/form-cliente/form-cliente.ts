import { Component, OnInit, inject, signal, Input } from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray, Validators,
  ReactiveFormsModule, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente, Endereco, CartaoCredito } from '../../../core/models/cliente.model';

function senhasIguais(group: AbstractControl): ValidationErrors | null {
  const senha    = group.get('senha')?.value;
  const confirmar = group.get('confirmarSenha')?.value;
  return senha && confirmar && senha !== confirmar ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-form-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper" style="max-width: 960px">

      <div class="page-header">
        <div>
          <div class="page-header__rotulo">{{ isEdicao ? 'RF0022' : 'RF0021' }}</div>
          <h1 class="page-header__titulo">{{ isEdicao ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
          <p class="page-header__sub">
            {{ isEdicao ? 'Atualize os dados cadastrais' : 'Preencha todos os campos obrigatórios' }}
          </p>
        </div>
        <div class="page-header__actions">
          <a routerLink="/clientes" class="btn btn--ghost">← Voltar</a>
        </div>
      </div>

      @if (erro()) {
        <div class="alert alert--danger">⚠️ {{ erro() }}</div>
      }
      @if (sucesso()) {
        <div class="alert alert--success">✅ {{ sucesso() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="salvar()">

        <!-- Dados Pessoais -->
        <div class="card" style="margin-bottom:16px">
          <div class="card__header">
            <span class="card__titulo">Dados Pessoais</span>
          </div>
          <div class="form-row form-row--2">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input formControlName="nome" type="text" placeholder="Nome completo" />
              @if (campo('nome')?.invalid && campo('nome')?.touched) {
                <span class="erro">Nome é obrigatório.</span>
              }
            </div>
            <div class="form-group">
              <label>CPF *</label>
              <input formControlName="cpf" type="text" placeholder="000.000.000-00"
                (input)="mascaraCpf($event)" maxlength="14" />
              @if (campo('cpf')?.invalid && campo('cpf')?.touched) {
                <span class="erro">CPF inválido ou obrigatório.</span>
              }
            </div>
          </div>
          <div class="form-row form-row--3">
            <div class="form-group">
              <label>E-mail *</label>
              <input formControlName="email" type="email" placeholder="email@exemplo.com" />
              @if (campo('email')?.invalid && campo('email')?.touched) {
                <span class="erro">E-mail inválido.</span>
              }
            </div>
            <div class="form-group">
              <label>Data de Nascimento *</label>
              <input formControlName="dataNascimento" type="date" />
              @if (campo('dataNascimento')?.invalid && campo('dataNascimento')?.touched) {
                <span class="erro">Data obrigatória.</span>
              }
            </div>
            <div class="form-group">
              <label>Gênero *</label>
              <select formControlName="genero">
                <option value="">Selecione</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
                <option value="NAO_INFORMADO">Prefiro não informar</option>
              </select>
            </div>
          </div>
          <div class="form-row form-row--3">
            <div class="form-group">
              <label>Tipo de Telefone *</label>
              <select formControlName="tipoTelefone">
                <option value="">Selecione</option>
                <option value="CELULAR">Celular</option>
                <option value="RESIDENCIAL">Residencial</option>
                <option value="COMERCIAL">Comercial</option>
              </select>
            </div>
            <div class="form-group">
              <label>DDD *</label>
              <input formControlName="ddd" type="text" placeholder="11" maxlength="2" />
            </div>
            <div class="form-group">
              <label>Número *</label>
              <input formControlName="numeroTelefone" type="text" placeholder="99999-0000" />
            </div>
          </div>
        </div>

        <!-- Senha (apenas no cadastro) -->
        @if (!isEdicao) {
          <div class="card" style="margin-bottom:16px" formGroupName="senhas">
            <div class="card__header">
              <span class="card__titulo">Acesso ao Sistema</span>
            </div>
            <div class="alert alert--info" style="margin-bottom:14px">
              🔒 Mínimo 8 caracteres, com letras maiúsculas, minúsculas e caractere especial (RNF0031).
            </div>
            <div class="form-row form-row--2">
              <div class="form-group">
                <label>Senha *</label>
                <input formControlName="senha" type="password" placeholder="••••••••" />
                @if (senhaGrupo.get('senha')?.invalid && senhaGrupo.get('senha')?.touched) {
                  <span class="erro">Mínimo 8 caracteres.</span>
                }
              </div>
              <div class="form-group">
                <label>Confirmar Senha *</label>
                <input formControlName="confirmarSenha" type="password" placeholder="••••••••" />
                @if (senhaGrupo.errors?.['senhasDiferentes'] && senhaGrupo.get('confirmarSenha')?.touched) {
                  <span class="erro">As senhas não conferem.</span>
                }
              </div>
            </div>
          </div>
        }

        <!-- Endereços -->
        <div class="card" style="margin-bottom:16px" formArrayName="enderecos">
          <div class="card__header">
            <span class="card__titulo">Endereços de Entrega (RF0026)</span>
            <button type="button" class="btn btn--secondary btn--sm" (click)="adicionarEndereco()">
              + Adicionar
            </button>
          </div>

          @if (enderecos.length === 0) {
            <p style="color:var(--mudo); font-size:.83rem">Nenhum endereço. Adicione ao menos um.</p>
          }

          @for (end of enderecos.controls; track end; let i = $index) {
            <div [formGroupName]="i" class="bloco-item">
              <div class="bloco-item__header">
                <span>📍 Endereço {{ i + 1 }}
                  @if (end.get('apelido')?.value) { — {{ end.get('apelido')?.value }} }
                </span>
                <button type="button" class="btn btn--danger btn--sm" (click)="removerEndereco(i)">
                  ✕ Remover
                </button>
              </div>

              <div class="form-row form-row--3">
                <div class="form-group">
                  <label>Apelido *</label>
                  <input formControlName="apelido" type="text" placeholder='"Casa", "Trabalho"' />
                </div>
                <div class="form-group">
                  <label>Tipo de Residência</label>
                  <select formControlName="tipoResidencia">
                    <option value="">Selecione</option>
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>CEP *</label>
                  <input formControlName="cep" type="text" placeholder="00000-000"
                    (blur)="buscarCep(i)" maxlength="9" />
                </div>
              </div>

              <div class="form-row form-row--4">
                <div class="form-group">
                  <label>Tipo Logradouro</label>
                  <select formControlName="tipoLogradouro">
                    <option value="RUA">Rua</option>
                    <option value="AVENIDA">Avenida</option>
                    <option value="TRAVESSA">Travessa</option>
                    <option value="ALAMEDA">Alameda</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div class="form-group" style="grid-column: span 2">
                  <label>Logradouro *</label>
                  <input formControlName="logradouro" type="text" placeholder="Nome da rua" />
                </div>
                <div class="form-group">
                  <label>Número *</label>
                  <input formControlName="numero" type="text" placeholder="123" />
                </div>
              </div>

              <div class="form-row form-row--3">
                <div class="form-group">
                  <label>Bairro *</label>
                  <input formControlName="bairro" type="text" />
                </div>
                <div class="form-group">
                  <label>Cidade *</label>
                  <input formControlName="cidade" type="text" />
                </div>
                <div class="form-group">
                  <label>Estado *</label>
                  <input formControlName="estado" type="text" maxlength="2" placeholder="SP" />
                </div>
              </div>

              <div class="form-row form-row--2">
                <div class="form-group">
                  <label>País</label>
                  <input formControlName="pais" type="text" />
                </div>
                <div class="form-group">
                  <label>Observações</label>
                  <input formControlName="observacoes" type="text" placeholder="Apto, complemento…" />
                </div>
              </div>

              <div style="display:flex; gap:20px; margin-top:4px">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:.82rem">
                  <input type="checkbox" formControlName="ehEntrega" /> Entrega
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:.82rem">
                  <input type="checkbox" formControlName="ehCobranca" /> Cobrança
                </label>
              </div>
            </div>
          }
        </div>

        <!-- Cartões -->
        <div class="card" style="margin-bottom:24px" formArrayName="cartoes">
          <div class="card__header">
            <span class="card__titulo">Cartões de Crédito (RF0027)</span>
            <button type="button" class="btn btn--secondary btn--sm" (click)="adicionarCartao()">
              + Adicionar
            </button>
          </div>

          @if (cartoes.length === 0) {
            <p style="color:var(--mudo); font-size:.83rem">Nenhum cartão. Opcional no cadastro.</p>
          }

          @for (cartao of cartoes.controls; track cartao; let i = $index) {
            <div [formGroupName]="i" class="bloco-item">
              <div class="bloco-item__header">
                <span>💳 Cartão {{ i + 1 }}</span>
                <button type="button" class="btn btn--danger btn--sm" (click)="removerCartao(i)">
                  ✕ Remover
                </button>
              </div>
              <div class="form-row form-row--2">
                <div class="form-group">
                  <label>Número *</label>
                  <input formControlName="numero" type="text" placeholder="0000 0000 0000 0000"
                    (input)="mascaraCartao($event)" maxlength="19" />
                </div>
                <div class="form-group">
                  <label>Nome Impresso *</label>
                  <input formControlName="nomeImpresso" type="text" placeholder="NOME NO CARTÃO" />
                </div>
              </div>
              <div class="form-row form-row--3">
                <div class="form-group">
                  <label>Bandeira *</label>
                  <select formControlName="bandeira">
                    <option value="">Selecione</option>
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="ELO">Elo</option>
                    <option value="AMEX">American Express</option>
                    <option value="HIPERCARD">Hipercard</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Código de Segurança *</label>
                  <input formControlName="codigoSeguranca" type="password" placeholder="•••" maxlength="4" />
                </div>
                <div class="form-group" style="display:flex; align-items:flex-end; padding-bottom:2px">
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom:0">
                    <input type="checkbox" formControlName="preferencial" /> Preferencial
                  </label>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Ações -->
        <div style="display:flex; gap:10px">
          <button type="submit" class="btn btn--primary btn--lg" [disabled]="salvando()">
            @if (salvando()) {
              <span class="spinner" style="width:14px;height:14px;border-top-color:var(--preto)"></span>
              Salvando…
            } @else {
              💾 {{ isEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente' }}
            }
          </button>
          <a routerLink="/clientes" class="btn btn--ghost btn--lg">Cancelar</a>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .bloco-item {
      border: 1px solid var(--borda);
      border-radius: 3px;
      padding: 16px;
      margin-bottom: 12px;
      background: var(--painel);
    }
    .bloco-item__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: .9rem;
      text-transform: uppercase;
      color: var(--claro);
    }
  `]
})
export class FormClienteComponent implements OnInit {
  @Input() id?: string;

  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(ClienteService);
  private readonly router  = inject(Router);

  isEdicao = false;
  salvando = signal(false);
  erro     = signal('');
  sucesso  = signal('');

  form!: FormGroup;

  get enderecos(): FormArray { return this.form.get('enderecos') as FormArray; }
  get cartoes():   FormArray { return this.form.get('cartoes')   as FormArray; }
  get senhaGrupo(): FormGroup { return this.form.get('senhas') as FormGroup; }

  campo(nome: string): AbstractControl | null { return this.form.get(nome); }

  ngOnInit(): void {
    this.isEdicao = !!this.id;
    this.buildForm();
    if (this.isEdicao) this.carregarCliente();
  }

  buildForm(): void {
    this.form = this.fb.group({
      nome:           ['', Validators.required],
      cpf:            ['', [Validators.required, Validators.minLength(11)]],
      email:          ['', [Validators.required, Validators.email]],
      dataNascimento: ['', Validators.required],
      genero:         ['', Validators.required],
      tipoTelefone:   ['', Validators.required],
      ddd:            ['', [Validators.required, Validators.maxLength(2)]],
      numeroTelefone: ['', Validators.required],
      enderecos:      this.fb.array([]),
      cartoes:        this.fb.array([]),
      ...(!this.isEdicao ? {
        senhas: this.fb.group({
          senha:          ['', [Validators.required, Validators.minLength(8)]],
          confirmarSenha: ['', Validators.required],
        }, { validators: senhasIguais })
      } : {})
    });
  }

  carregarCliente(): void {
    this.service.listarTodos().subscribe({
      next: (lista) => {
        const c = lista.find((x) => x.id === Number(this.id));
        if (!c) { this.erro.set('Cliente não encontrado.'); return; }
        this.form.patchValue({
          nome: c.nome, cpf: c.cpf, email: c.email,
          dataNascimento: c.dataNascimento, genero: c.genero,
          tipoTelefone: c.tipoTelefone, ddd: c.ddd, numeroTelefone: c.numeroTelefone,
        });
        c.enderecos?.forEach((e) => this.enderecos.push(this.novoEnderecoGroup(e)));
        c.cartoes?.forEach((ct) => this.cartoes.push(this.novoCartaoGroup(ct)));
      },
      error: (e) => this.erro.set(e.message),
    });
  }

  // ── Endereços
  novoEnderecoGroup(e?: Partial<Endereco>): FormGroup {
    return this.fb.group({
      id:             [e?.id ?? null],
      apelido:        [e?.apelido ?? '',    Validators.required],
      tipoResidencia: [e?.tipoResidencia ?? ''],
      tipoLogradouro: [e?.tipoLogradouro ?? 'RUA'],
      logradouro:     [e?.logradouro ?? '', Validators.required],
      numero:         [e?.numero ?? '',     Validators.required],
      bairro:         [e?.bairro ?? '',     Validators.required],
      cep:            [e?.cep ?? '',        Validators.required],
      cidade:         [e?.cidade ?? '',     Validators.required],
      estado:         [e?.estado ?? '',     Validators.required],
      pais:           [e?.pais ?? 'Brasil'],
      observacoes:    [e?.observacoes ?? ''],
      ehEntrega:      [e?.ehEntrega ?? true],
      ehCobranca:     [e?.ehCobranca ?? false],
    });
  }

  adicionarEndereco(): void { this.enderecos.push(this.novoEnderecoGroup()); }
  removerEndereco(i: number): void { this.enderecos.removeAt(i); }

  // ── Cartões
  novoCartaoGroup(c?: Partial<CartaoCredito>): FormGroup {
    return this.fb.group({
      id:              [c?.id ?? null],
      numero:          [c?.numero ?? '',          Validators.required],
      nomeImpresso:    [c?.nomeImpresso ?? '',     Validators.required],
      bandeira:        [c?.bandeira ?? '',         Validators.required],
      codigoSeguranca: [c?.codigoSeguranca ?? '',  Validators.required],
      preferencial:    [c?.preferencial ?? false],
    });
  }

  adicionarCartao(): void { this.cartoes.push(this.novoCartaoGroup()); }
  removerCartao(i: number): void { this.cartoes.removeAt(i); }

  // ── Submit
  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.salvando.set(true);
    this.erro.set('');

    const { senhas, ...resto } = this.form.value;
    const payload: Cliente = { ...resto, ...(senhas ? { senha: senhas.senha } : {}) };

    const obs = this.isEdicao
      ? this.service.atualizar(Number(this.id), payload)
      : this.service.criar(payload);

    obs.subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(this.isEdicao ? 'Cliente atualizado!' : 'Cliente cadastrado!');
        setTimeout(() => this.router.navigate(['/clientes']), 1500);
      },
      error: (e) => { this.salvando.set(false); this.erro.set(e.message); },
    });
  }

  // ── Máscaras
  mascaraCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.form.get('cpf')?.setValue(v, { emitEvent: false });
    input.value = v;
  }

  mascaraCartao(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    input.value = v;
  }

  // ── CEP via ViaCEP
  buscarCep(idx: number): void {
    const cep = this.enderecos.at(idx).get('cep')?.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) return;
        this.enderecos.at(idx).patchValue({
          logradouro: data.logradouro,
          bairro:     data.bairro,
          cidade:     data.localidade,
          estado:     data.uf,
          pais:       'Brasil',
        });
      })
      .catch(() => {});
  }
}