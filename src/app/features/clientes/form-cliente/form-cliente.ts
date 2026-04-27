import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { senhasIguais } from '../../../shared/validators/senhas-iguais.validator';
import type { Endereco } from '../../../core/models/cliente.model';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-form-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, LoadingComponent],
  template: `
    <div class="conteudo" style="max-width: 800px;">
      <div class="page-header">
        <div>
          <div class="page-header-label">Clientes</div>
          <h1>{{ editando() ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
        </div>
      </div>

      @if (erro()) {
        <app-alert tipo="danger" [mensagem]="erro()" />
      }

      @if (carregando()) {
        <app-loading mensagem="Carregando..." />
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="card">
            <div class="card-header">
              <h3 class="card-titulo">Dados Pessoais</h3>
            </div>
            <div class="form-row cols-2">
              <div class="campo">
                <label>Nome</label>
                <input class="form-control" formControlName="nome" placeholder="Nome completo" />
              </div>
              <div class="campo">
                <label>Gênero</label>
                <select class="form-control" formControlName="genero">
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="NAO_INFORMAR">Prefiro não informar</option>
                </select>
              </div>
              <div class="campo">
                <label>Data de Nascimento</label>
                <input class="form-control" type="date" formControlName="dataNascimento" />
              </div>
              <div class="campo">
                <label>CPF</label>
                <input class="form-control" formControlName="cpf" placeholder="000.000.000-00" maxlength="14" />
              </div>
              <div class="campo">
                <label>Tipo Telefone</label>
                <select class="form-control" formControlName="tipoTelefone">
                  <option value="CELULAR">Celular</option>
                  <option value="FIXO">Fixo</option>
                </select>
              </div>
              <div class="form-row cols-2">
                <div class="campo">
                  <label>DDD</label>
                  <input class="form-control" formControlName="ddd" maxlength="2" placeholder="11" />
                </div>
                <div class="campo">
                  <label>Telefone</label>
                  <input class="form-control" formControlName="numeroTelefone" placeholder="912345678" />
                </div>
              </div>
            </div>
          </div>

          @if (!editando()) {
            <div class="card">
              <div class="card-header">
                <h3 class="card-titulo">Acesso ao Sistema</h3>
              </div>
              <div formGroupName="acesso">
                <div class="form-row cols-2">
                  <div class="campo">
                    <label>E-mail</label>
                    <input class="form-control" type="email" formControlName="email" placeholder="email@exemplo.com" />
                  </div>
                  <div class="campo">
                    <label>Senha</label>
                    <input class="form-control" type="password" formControlName="senha" placeholder="Mín. 8 caracteres" />
                    @if (form.get('acesso.senha')?.errors?.['minlength']) {
                      <span class="form-error">Mínimo 8 caracteres</span>
                    }
                  </div>
                  <div class="campo">
                    <label>Confirmar Senha</label>
                    <input class="form-control" type="password" formControlName="confirmacaoSenha" placeholder="Repita a senha" />
                    @if (form.get('acesso.confirmacaoSenha')?.errors?.['senhasDiferentes']) {
                      <span class="form-error">Senhas não conferem</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <div class="card">
            <div class="card-header">
              <h3 class="card-titulo">Endereços</h3>
              <button type="button" class="btn btn-secondary btn-sm" (click)="adicionarEndereco()">+ Endereço</button>
            </div>
            <div formArrayName="enderecos">
              @for (end of enderecos.controls; track i; let i = $index) {
                <div [formGroupName]="i" class="mini-card">
                  <div class="card-header">
                    <span class="card-titulo">Endereço {{ i + 1 }}</span>
                    @if (enderecos.controls.length > 1) {
                      <button type="button" class="btn btn-danger btn-sm" (click)="enderecos.removeAt(i)">Remover</button>
                    }
                  </div>
                  <div class="form-row cols-2">
                    <div class="campo">
                      <label>Apelido</label>
                      <input class="form-control" formControlName="apelido" placeholder="Casa, Trabalho..." />
                    </div>
                    <div class="campo">
                      <label>Tipo Residência</label>
                      <select class="form-control" formControlName="tipoResidencia">
                        <option value="CASA">Casa</option>
                        <option value="APARTAMENTO">Apartamento</option>
                        <option value="COMERCIAL">Comercial</option>
                      </select>
                    </div>
                    <div class="campo">
                      <label>CEP</label>
                      <input class="form-control" formControlName="cep" placeholder="00000-000" maxlength="9" />
                    </div>
                    <div class="campo">
                      <label>Tipo Logradouro</label>
                      <select class="form-control" formControlName="tipoLogradouro">
                        <option value="RUA">Rua</option>
                        <option value="AVENIDA">Avenida</option>
                        <option value="PRACA">Praça</option>
                        <option value="RODOVIA">Rodovia</option>
                      </select>
                    </div>
                    <div class="campo" style="grid-column: span 2;">
                      <label>Logradouro</label>
                      <input class="form-control" formControlName="logradouro" placeholder="Nome da rua" />
                    </div>
                    <div class="campo">
                      <label>Número</label>
                      <input class="form-control" formControlName="numero" placeholder="123" />
                    </div>
                    <div class="campo">
                      <label>Bairro</label>
                      <input class="form-control" formControlName="bairro" placeholder="Bairro" />
                    </div>
                    <div class="campo">
                      <label>Cidade</label>
                      <input class="form-control" formControlName="cidade" placeholder="Cidade" />
                    </div>
                    <div class="campo">
                      <label>Estado</label>
                      <select class="form-control" formControlName="estado">
                        @for (uf of estados; track uf) {
                          <option [value]="uf">{{ uf }}</option>
                        }
                      </select>
                    </div>
                    <div class="campo">
                      <label>País</label>
                      <input class="form-control" formControlName="pais" placeholder="Brasil" />
                    </div>
                    <div class="campo" style="grid-column: span 2;">
                      <label>Observações</label>
                      <input class="form-control" formControlName="observacoes" placeholder="Ponto de referência..." />
                    </div>
                    <div style="display: flex; gap: 16px;">
                      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="checkbox" formControlName="ehEntrega" />
                        <span>Endereço de entrega</span>
                      </label>
                      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="checkbox" formControlName="ehCobranca" />
                        <span>Endereço de cobrança</span>
                      </label>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-titulo">Cartões de Crédito</h3>
              <button type="button" class="btn btn-secondary btn-sm" (click)="adicionarCartao()">+ Cartão</button>
            </div>
            <div formArrayName="cartoes">
              @for (cartao of cartoes.controls; track j; let j = $index) {
                <div [formGroupName]="j" class="mini-card">
                  <div class="card-header">
                    <span class="card-titulo">Cartão {{ j + 1 }}</span>
                    @if (cartoes.controls.length > 1) {
                      <button type="button" class="btn btn-danger btn-sm" (click)="cartoes.removeAt(j)">Remover</button>
                    }
                  </div>
                  <div class="form-row cols-2">
                    <div class="campo">
                      <label>Número</label>
                      <input class="form-control" formControlName="numero" placeholder="0000 0000 0000 0000" maxlength="19" />
                    </div>
                    <div class="campo">
                      <label>Nome Impresso</label>
                      <input class="form-control" formControlName="nomeImpresso" placeholder="Nome no cartão" />
                    </div>
                    <div class="campo">
                      <label>Bandeira</label>
                      <select class="form-control" formControlName="bandeira">
                        <option value="">Selecione</option>
                        <option value="VISA">Visa</option>
                        <option value="MASTERCARD">Mastercard</option>
                        <option value="ELO">Elo</option>
                        <option value="AMEX">Amex</option>
                      </select>
                    </div>
                    <div class="campo">
                      <label>CVV</label>
                      <input class="form-control" formControlName="codigoSeguranca" placeholder="123" maxlength="4" />
                    </div>
                    <div>
                      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="radio" name="preferencial" [checked]="cartao.get('preferencial')?.value" (change)="setPreferencial(j)" />
                        <span>Preferencial</span>
                      </label>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <a routerLink="/clientes" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || salvando()">
              {{ salvando() ? 'Salvando...' : (editando() ? 'Atualizar' : 'Cadastrar') }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormClienteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected editando = signal(false);
  protected carregando = signal(false);
  protected salvando = signal(false);
  protected erro = signal('');
  protected clienteId: number | null = null;

  protected readonly estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ];

  protected form = this.fb.group({
    nome: ['', Validators.required],
    genero: [''],
    dataNascimento: [''],
    cpf: ['', Validators.required],
    tipoTelefone: ['CELULAR'],
    ddd: [''],
    numeroTelefone: [''],
    acesso: this.fb.group(
      {
        email: ['', [Validators.email]],
        senha: ['', [Validators.minLength(8)]],
        confirmacaoSenha: [''],
      },
      { validators: senhasIguais('senha', 'confirmacaoSenha') },
    ),
    enderecos: this.fb.array([]),
    cartoes: this.fb.array([]),
  });

  get enderecos() {
    return this.form.get('enderecos') as FormArray;
  }

  get cartoes() {
    return this.form.get('cartoes') as FormArray;
  }

  constructor() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.editando.set(true);
      this.clienteId = Number(id);
      this.carregarCliente(this.clienteId);
    }
  }

  private carregarCliente(id: number) {
    this.carregando.set(true);
    this.clienteService.buscarPorId(id).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          nome: cliente.nome,
          genero: cliente.genero,
          dataNascimento: cliente.dataNascimento,
          cpf: cliente.cpf,
          tipoTelefone: cliente.tipoTelefone,
          ddd: cliente.ddd,
          numeroTelefone: cliente.numeroTelefone,
        });

        this.enderecos.clear();
        cliente.enderecos?.forEach((e) => this.enderecos.push(this.criarEnderecoGroup(e)));

        this.cartoes.clear();
        cliente.cartoes?.forEach((c) => this.cartoes.push(this.criarCartaoGroup(c)));

        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err.message);
        this.carregando.set(false);
      },
    });
  }

  private criarEnderecoGroup(e?: Partial<Endereco>) {
    return this.fb.group({
      apelido: [e?.apelido ?? ''],
      tipoResidencia: [e?.tipoResidencia ?? 'CASA'],
      tipoLogradouro: [e?.tipoLogradouro ?? 'RUA'],
      logradouro: [e?.logradouro ?? ''],
      numero: [e?.numero ?? ''],
      bairro: [e?.bairro ?? ''],
      cep: [e?.cep ?? ''],
      cidade: [e?.cidade ?? ''],
      estado: [e?.estado ?? 'SP'],
      pais: [e?.pais ?? 'Brasil'],
      observacoes: [e?.observacoes ?? ''],
      ehEntrega: [e?.ehEntrega ?? false],
      ehCobranca: [e?.ehCobranca ?? false],
    });
  }

  private criarCartaoGroup(c?: Partial<{ numero: string; nomeImpresso: string; bandeira: string; codigoSeguranca: string; preferencial: boolean }>) {
    return this.fb.group({
      numero: [c?.numero ?? ''],
      nomeImpresso: [c?.nomeImpresso ?? ''],
      bandeira: [c?.bandeira ?? ''],
      codigoSeguranca: [c?.codigoSeguranca ?? ''],
      preferencial: [c?.preferencial ?? false],
    });
  }

  adicionarEndereco() {
    this.enderecos.push(this.criarEnderecoGroup());
  }

  adicionarCartao() {
    this.cartoes.push(this.criarCartaoGroup());
  }

  setPreferencial(index: number) {
    this.cartoes.controls.forEach((c, i) => c.patchValue({ preferencial: i === index }));
  }

  submit() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.erro.set('');

    const dados: Record<string, unknown> = {
      nome: this.form.value.nome,
      genero: this.form.value.genero,
      dataNascimento: this.form.value.dataNascimento,
      cpf: this.form.value.cpf,
      tipoTelefone: this.form.value.tipoTelefone,
      ddd: this.form.value.ddd,
      numeroTelefone: this.form.value.numeroTelefone,
      enderecos: this.form.value.enderecos,
      cartoes: this.form.value.cartoes,
    };

    if (!this.editando()) {
      const acesso = this.form.value.acesso;
      Object.assign(dados, {
        email: acesso?.email,
        senha: acesso?.senha,
        papel: 'CLIENTE',
      });
    }

    const obs = this.editando() && this.clienteId
      ? this.clienteService.atualizar(this.clienteId, dados)
      : this.clienteService.criar(dados);

    obs.subscribe({
      next: (cliente) => this.router.navigate(['/clientes', cliente.id ?? this.clienteId]),
      error: (err) => {
        this.erro.set(err.message);
        this.salvando.set(false);
      },
    });
  }
}
