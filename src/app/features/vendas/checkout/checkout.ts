import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { AuthService } from '../../../core/services/auth.service';
import { FreteService } from '../../../core/services/frete.service';
import { CupomService } from '../../../core/services/cupom.service';
import { VendaService } from '../../../core/services/venda.service';
import type { OpcaoFrete } from '../../../core/models/carrinho.model';
import type { Endereco, CartaoCredito } from '../../../core/models/cliente.model';
import { OrderSummaryComponent } from '../../../shared/components/order-summary/order-summary';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule, OrderSummaryComponent, AlertComponent, LoadingComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-header-label">Checkout</div>
          <h1>Finalizar Pedido</h1>
        </div>
      </div>

      @if (!carrinho.temItens()) {
        <app-alert tipo="warn" mensagem="Seu carrinho está vazio." />
        <a routerLink="/produtos" class="btn btn-accent">Ver Produtos</a>
      } @else {
        <div class="steps" style="max-width: 600px; margin: 0 auto 32px;">
          <div class="step">
            <div class="step-num">1</div>
            <span class="step-label">Endereço</span>
            <div class="step-line"></div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <span class="step-label">Frete</span>
            <div class="step-line"></div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <span class="step-label">Pagamento</span>
          </div>
        </div>

        <div style="max-width: 1100px; margin: 0 auto;">
          <div class="grid-2">
            <div style="display: flex; flex-direction: column; gap: 24px;">
              <div class="card">
                <div class="card-header">
                  <span class="card-titulo">1. Endereço de Entrega</span>
                </div>
                @if (enderecos().length > 0) {
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    @for (end of enderecos(); track end.id) {
                      <div class="mini-card" [class.selected]="enderecoSelecionado()?.id === end.id" (click)="selecionarEndereco(end)">
                        <div class="mini-card-info">
                          <strong>{{ end.apelido }}</strong>
                          <p>{{ end.logradouro }}, {{ end.numero }}</p>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <app-alert tipo="info" mensagem="Nenhum endereço encontrado. Use o formulário abaixo." />
                }
                <button class="btn btn-sm btn-outline" style="margin-top: 12px;" (click)="mostrarNovoEndereco.set(!mostrarNovoEndereco())">
                  {{ mostrarNovoEndereco() ? 'Cancelar' : '+ Novo endereço' }}
                </button>
                @if (mostrarNovoEndereco()) {
                  <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <input class="form-control" placeholder="CEP" [(ngModel)]="novoEndereco.cep" />
                    <input class="form-control" placeholder="Logradouro" [(ngModel)]="novoEndereco.logradouro" />
                    <div class="grid-2">
                      <input class="form-control" placeholder="Número" [(ngModel)]="novoEndereco.numero" />
                      <input class="form-control" placeholder="Bairro" [(ngModel)]="novoEndereco.bairro" />
                    </div>
                    <div class="grid-2">
                      <input class="form-control" placeholder="Cidade" [(ngModel)]="novoEndereco.cidade" />
                      <input class="form-control" placeholder="Estado" [(ngModel)]="novoEndereco.estado" />
                    </div>
                    <button class="btn btn-sm btn-primary" (click)="usarNovoEndereco()">Usar este endereço</button>
                  </div>
                }
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-titulo">2. Frete</span>
                </div>
                @if (carregandoFrete()) {
                  <app-loading mensagem="Calculando frete..." />
                } @else {
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    @for (opcao of opcoesFrete(); track opcao.id) {
                      <div class="mini-card" [class.selected]="carrinho.freteSelecionado()?.id === opcao.id" (click)="carrinho.setFrete(opcao)">
                        <div class="mini-card-info">
                          <strong>{{ opcao.nome }}</strong>
                          <p>{{ opcao.prazoDias }} dias úteis</p>
                        </div>
                        <strong class="prod-preco">{{ opcao.valor | currency:'BRL':'symbol':'1.2-2' }}</strong>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="card">
                <div class="card-header">
                  <span class="card-titulo">3. Pagamento</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 20px;">

                  <div class="campo">
                    <span class="rotulo">Cupom Promocional</span>
                    <div class="search-bar">
                      <input class="form-control" placeholder="Código do cupom" [(ngModel)]="codigoCupom" />
                      <button class="btn btn-sm btn-primary" (click)="validarCupom()">Validar</button>
                    </div>
                    @if (carrinho.cupomPromocional()) {
                      <span class="status s-verde">
                        Cupom {{ carrinho.cupomPromocional()?.codigo }} aplicado (-{{ carrinho.cupomPromocional()?.valor | currency:'BRL' }})
                      </span>
                    }
                  </div>

                  <div class="campo">
                    <span class="rotulo">Cupons de Troca</span>
                    @if (cuponsTroca().length > 0) {
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        @for (cupom of cuponsTroca(); track cupom.id) {
                          <div class="mini-card" [class.selected]="isCupomTrocaSelecionado(cupom.id)" (click)="toggleCupomTroca(cupom)">
                            <div class="mini-card-info">
                              <span>{{ cupom.codigo }}</span>
                              <strong>{{ cupom.valor | currency:'BRL' }}</strong>
                            </div>
                          </div>
                        }
                      </div>
                    } @else {
                      <p>Nenhum cupom de troca disponível.</p>
                    }
                  </div>

                  <div class="campo">
                    <span class="rotulo">Cartões de Crédito</span>
                    @if (cartoes().length > 0) {
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        @for (cartao of cartoes(); track cartao.id) {
                          <div class="mini-card" [class.selected]="isCartaoSelecionado(cartao.id!)" (click)="toggleCartao(cartao)">
                            <div style="display: flex; align-items: center; gap: 12px;">
                              @if (cartao.preferencial) {
                                <span class="tag-pref">Preferencial</span>
                              }
                            </div>
                            <div class="mini-card-info" style="flex: 1;">
                              <strong>{{ cartao.bandeira }}</strong>
                              <p>**** {{ cartao.ultimosDigitos }} · {{ cartao.nomeImpresso }}</p>
                            </div>
                          </div>
                        }
                      </div>
                      @if (cartoesSelecionados.length > 0) {
                        <div style="margin-top: 12px;">
                          <div class="campo">
                            <span class="rotulo">Valor a cobrar neste cartão</span>
                            <input
                              class="form-control"
                              type="number"
                              [value]="getValorCartao()"
                              (input)="setValorCartao($any($event.target).value)"
                              min="10"
                              step="0.01"
                            />
                          </div>
                        </div>
                      }
                    } @else {
                      <p>Nenhum cartão salvo.</p>
                    }
                    <button class="btn btn-sm btn-outline" style="margin-top: 8px;" (click)="mostrarNovoCartao.set(!mostrarNovoCartao())">
                      {{ mostrarNovoCartao() ? 'Cancelar' : '+ Novo Cartão' }}
                    </button>
                    @if (mostrarNovoCartao()) {
                      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
                        <input class="form-control" placeholder="Número do cartão" [(ngModel)]="novoCartao.numero" />
                        <input class="form-control" placeholder="Nome impresso" [(ngModel)]="novoCartao.nomeImpresso" />
                        <div class="grid-2">
                          <select class="form-control" [(ngModel)]="novoCartao.bandeira">
                            <option value="">Bandeira</option>
                            <option value="VISA">Visa</option>
                            <option value="MASTERCARD">Mastercard</option>
                            <option value="ELO">Elo</option>
                          </select>
                          <input class="form-control" placeholder="CVV" [(ngModel)]="novoCartao.codigoSeguranca" />
                        </div>
                        <button class="btn btn-sm btn-primary" (click)="adicionarNovoCartao()">Adicionar Cartão</button>
                      </div>
                    }
                  </div>

                </div>
              </div>

              @if (erro()) {
                <app-alert tipo="danger" [mensagem]="erro()" />
              }
            </div>

            <div>
              <app-order-summary
                [totais]="carrinho.totais()"
                [mostrarFrete]="true"
                [freteNome]="carrinho.freteSelecionado()?.nome ?? ''"
              />
              <button class="btn-checkout" style="margin-top: 16px;" [disabled]="salvando()" (click)="finalizar()">
                @if (salvando()) {
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
                    Finalizando...
                  </div>
                } @else {
                  Finalizar Compra →
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  protected readonly carrinho = inject(CarrinhoService);
  private readonly auth = inject(AuthService);
  private readonly freteService = inject(FreteService);
  private readonly cupomService = inject(CupomService);
  private readonly vendaService = inject(VendaService);
  private readonly router = inject(Router);

  protected enderecos = signal<Endereco[]>([]);
  protected enderecoSelecionado = signal<Endereco | null>(null);
  protected cartoes = signal<CartaoCredito[]>([]);
  protected cuponsTroca = signal<any[]>([]);
  protected opcoesFrete = signal<OpcaoFrete[]>([]);
  protected carregandoFrete = signal(false);
  protected codigoCupom = '';
  protected mostrarNovoEndereco = signal(false);
  protected mostrarNovoCartao = signal(false);
  protected salvando = signal(false);
  protected erro = signal('');

  protected cartoesSelecionados: number[] = [];
  protected valoresCartoes: Record<number, number> = {};
  protected cuponsTrocaSelecionados: number[] = [];

  protected novoEndereco = {
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    apelido: 'Novo Endereço',
    tipoResidencia: 'CASA',
    tipoLogradouro: 'RUA',
    ehEntrega: true,
    ehCobranca: false,
  };

  protected novoCartao = {
    numero: '',
    nomeImpresso: '',
    bandeira: '',
    codigoSeguranca: '',
  };

  constructor() {
    this.auth.getEnderecos().subscribe((ends) => this.enderecos.set(ends));
    this.auth.getCartoes().subscribe((carts) => {
      this.cartoes.set(carts);
      if (carts.length > 0) {
        const primeiro = carts[0];
        if (primeiro.id) {
          this.cartoesSelecionados = [primeiro.id];
          this.valoresCartoes[primeiro.id] = this.carrinho.totais().totalAPagar;
        }
      }
    });

    const clienteId = this.auth['_clienteAtual']()?.id;
    if (clienteId) {
      this.cupomService.listarCuponsTroca(clienteId).subscribe((c) => this.cuponsTroca.set(c));
    }
  }

  protected getValorCartao(): number {
    if (this.cartoesSelecionados.length === 0) return 0;
    const id = this.cartoesSelecionados[0];
    return this.valoresCartoes[id] ?? this.carrinho.totais().totalAPagar;
  }

  protected setValorCartao(val: string) {
    if (this.cartoesSelecionados.length === 0) return;
    const id = this.cartoesSelecionados[0];
    const n = Number(val);
    this.valoresCartoes[id] = isNaN(n) ? 0 : n;
  }

  protected adicionarNovoCartao() {
    const cartao: CartaoCredito = {
      numero: this.novoCartao.numero,
      nomeImpresso: this.novoCartao.nomeImpresso,
      bandeira: this.novoCartao.bandeira,
      codigoSeguranca: this.novoCartao.codigoSeguranca,
      preferencial: this.cartoes().length === 0,
    };
    this.auth.adicionarCartao(cartao).subscribe((saved) => {
      this.cartoes.update((list) => [...list, saved]);
      this.mostrarNovoCartao.set(false);
      this.novoCartao = { numero: '', nomeImpresso: '', bandeira: '', codigoSeguranca: '' };
    });
  }

  selecionarEndereco(end: Endereco) {
    this.enderecoSelecionado.set(end);
    this.carrinho.setEnderecoEntrega(end);
    this.carregarFrete(end.cep);
  }

  usarNovoEndereco() {
    const end: Endereco = { ...this.novoEndereco, id: undefined, observacoes: '' };
    this.selecionarEndereco(end);
    this.mostrarNovoEndereco.set(false);
  }

  private carregarFrete(cep: string) {
    this.carregandoFrete.set(true);
    this.freteService.calcularOpcoes(cep, this.carrinho.itens()).subscribe((opcoes) => {
      this.opcoesFrete.set(opcoes);
      this.carregandoFrete.set(false);
    });
  }

  validarCupom() {
    if (!this.codigoCupom) return;
    this.cupomService.validarCupom(this.codigoCupom).subscribe((cupom) => {
      if (cupom && cupom.tipo === 'PROMOCIONAL') {
        this.carrinho.setCupomPromocional(cupom);
      }
    });
  }

  isCupomTrocaSelecionado(id: number) {
    return this.carrinho.cuponsTroca().some((c) => c.id === id);
  }

  toggleCupomTroca(cupom: any) {
    if (this.isCupomTrocaSelecionado(cupom.id)) {
      this.carrinho.removerCupomTroca(cupom.id);
    } else {
      this.carrinho.adicionarCupomTroca(cupom);
    }
  }

  isCartaoSelecionado(id: number) {
    return this.cartoesSelecionados.includes(id);
  }

  toggleCartao(cartao: CartaoCredito) {
    if (!cartao.id) return;
    this.cartoesSelecionados = [cartao.id];
    const total = this.carrinho.totais().totalAPagar;
    this.valoresCartoes[cartao.id] = total;
  }

  finalizar() {
    const clienteId = this.auth['_clienteAtual']()?.id;
    if (!clienteId) { this.erro.set('Faça login para finalizar a compra'); return; }
    if (!this.enderecoSelecionado()) { this.erro.set('Selecione um endereço de entrega'); return; }
    if (!this.carrinho.freteSelecionado()) { this.erro.set('Selecione uma opção de frete'); return; }

    const totalAPagar = this.carrinho.totais().totalAPagar;
    const pagamentos = this.cartoesSelecionados
      .map((id) => ({ cartaoId: id, valor: Number(this.valoresCartoes[id]) || 0 }))
      .filter((p) => p.valor > 0);

    const somaPagamentos = pagamentos.reduce((acc, p) => acc + p.valor, 0);
    if (Math.abs(somaPagamentos - totalAPagar) > 0.01) {
      this.erro.set(`Total a pagar é ${totalAPagar.toFixed(2)}, mas a soma dos cartões é ${somaPagamentos.toFixed(2)}`);
      return;
    }

    this.salvando.set(true);
    this.erro.set('');

    const dto = {
      clienteId,
      itens: this.carrinho.itens().map((i) => ({
        produtoId: i.produto.id,
        produtoNome: i.produto.nome,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
      })),
      enderecoEntrega: {
        apelido: this.enderecoSelecionado()!.apelido,
        logradouro: this.enderecoSelecionado()!.logradouro,
        numero: this.enderecoSelecionado()!.numero,
        bairro: this.enderecoSelecionado()!.bairro,
        cep: this.enderecoSelecionado()!.cep,
        cidade: this.enderecoSelecionado()!.cidade,
        estado: this.enderecoSelecionado()!.estado,
        pais: this.enderecoSelecionado()!.pais,
      },
      frete: {
        tipo: this.carrinho.freteSelecionado()?.nome ?? '',
        prazoDias: this.carrinho.freteSelecionado()?.prazoDias ?? 0,
        valor: this.carrinho.freteSelecionado()?.valor ?? 0,
      },
      pagamentosCartao: pagamentos,
      cupomPromocionalId: this.carrinho.cupomPromocional()?.id ?? undefined,
      cuponsTrocaIds: this.carrinho.cuponsTroca().length > 0 ? this.carrinho.cuponsTroca().map((c) => c.id) : undefined,
    };

    this.vendaService.finalizarCompra(dto).subscribe({
      next: (venda) => {
        this.carrinho.limpar();
        this.router.navigate(['/pedido', venda.id]);
      },
      error: (err) => {
        this.erro.set(err.message);
        this.salvando.set(false);
      },
    });
  }
}
