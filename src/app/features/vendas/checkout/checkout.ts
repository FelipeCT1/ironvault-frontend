import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CarrinhoService } from '../../../core/services/carrinho.service';
import { AuthService } from '../../../core/services/auth.service';
import { FreteService } from '../../../core/services/frete.service';
import { CupomService } from '../../../core/services/cupom.service';
import { VendaService } from '../../../core/services/venda.service';

import { Endereco, CartaoCredito } from '../../../core/models/cliente.model';
import { OpcaoFrete, Cupom } from '../../../core/models/carrinho.model';
import { PagamentoCartao, Venda } from '../../../core/models/venda.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="page-wrapper" style="max-width: 1100px">
      <div class="page-header">
        <div>
          <div class="page-header__rotulo">RF0033 – RF0037</div>
          <h1 class="page-header__titulo">Checkout</h1>
          <p class="page-header__sub">Finalize sua compra</p>
        </div>
        <div class="page-header__actions">
          <a routerLink="/carrinho" class="btn btn--ghost">← Voltar ao carrinho</a>
        </div>
      </div>

      @if (!temItens()) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-state__icon">🛒</div>
            <div class="empty-state__title">Carrinho vazio</div>
            <div class="empty-state__sub">Adicione produtos antes de fazer checkout.</div>
            <a routerLink="/produtos" class="btn btn--primary" style="margin-top: 16px">
              Ver Produtos
            </a>
          </div>
        </div>
      }

      @if (temItens()) {
        <div class="grid-2" style="gap: 24px; align-items: start">
          <!-- Passos do checkout -->
          <div>
            <!-- Passo 1: Endereço -->
            <div class="card" style="margin-bottom: 20px">
              <div class="card__header">
                <span class="card__titulo">1. Endereço de Entrega (RF0035)</span>
                <span class="step-badge" [class.step-badge--active]="etapa() >= 1">1</span>
              </div>

              @if (carregandoEnderecos()) {
                <div class="loading-state"><span class="spinner"></span> Carregando endereços…</div>
              }

              @if (!carregandoEnderecos()) {
                <div class="enderecos-lista">
                  @for (end of enderecos(); track end.id) {
                    <label class="endereco-option" [class.endereco-option--selected]="enderecoSelecionado()?.id === end.id">
                      <input
                        type="radio"
                        name="endereco"
                        [value]="end"
                        [checked]="enderecoSelecionado()?.id === end.id"
                        (change)="selecionarEndereco(end)">
                      <div class="endereco-option__content">
                        <strong>{{ end.apelido }}</strong>
                        <p>{{ end.tipoLogradouro }} {{ end.logradouro }}, {{ end.numero }}</p>
                        <p>{{ end.bairro }} · {{ end.cidade }}/{{ end.estado }}</p>
                        <p class="endereco-option__cep">CEP: {{ end.cep }}</p>
                      </div>
                    </label>
                  }
                </div>
              }
            </div>

            <!-- Passo 2: Frete -->
            <div class="card" style="margin-bottom: 20px">
              <div class="card__header">
                <span class="card__titulo">2. Frete (RF0034)</span>
                <span class="step-badge" [class.step-badge--active]="etapa() >= 2">2</span>
              </div>

              @if (!enderecoSelecionado()) {
                <p style="color: var(--mudo); font-size: .85rem">Selecione um endereço para ver as opções de frete.</p>
              }

              @if (enderecoSelecionado() && carregandoFrete()) {
                <div class="loading-state"><span class="spinner"></span> Calculando frete…</div>
              }

              @if (enderecoSelecionado() && !carregandoFrete() && opcoesFrete().length > 0) {
                <div class="frete-options">
                  @for (frete of opcoesFrete(); track frete.id) {
                    <label class="frete-option" [class.frete-option--selected]="freteSelecionado()?.id === frete.id">
                      <input
                        type="radio"
                        name="frete"
                        [value]="frete"
                        [checked]="freteSelecionado()?.id === frete.id"
                        (change)="selecionarFrete(frete)">
                      <div class="frete-option__content">
                        <strong>{{ frete.nome }}</strong>
                        <p>{{ frete.prazoDias }} dias úteis</p>
                      </div>
                      <span class="frete-option__valor">{{ frete.valor | currency:'BRL' }}</span>
                    </label>
                  }
                </div>
              }
            </div>

            <!-- Passo 3: Pagamento -->
            <div class="card" style="margin-bottom: 20px">
              <div class="card__header">
                <span class="card__titulo">3. Pagamento (RF0036)</span>
                <span class="step-badge" [class.step-badge--active]="etapa() >= 3">3</span>
              </div>

              <!-- Cupons -->
              <div style="margin-bottom: 24px">
                <h4 style="font-size: .85rem; font-weight: 700; margin-bottom: 12px">Cupons</h4>

                <!-- Cupom promocional -->
                <div class="cupom-section">
                  <label style="font-size: .75rem; color: var(--mudo); display: block; margin-bottom: 6px">
                    Cupom promocional (RN0033: apenas 1 por compra)
                  </label>
                  <div style="display: flex; gap: 8px">
                    <input
                      type="text"
                      [value]="cupomPromocional()?.codigo ?? ''"
                      (input)="aplicarCupomPromocional($event)"
                      placeholder="Código promocional"
                      style="flex: 1">
                    <button
                      (click)="removerCupomPromocional()"
                      class="btn btn--ghost btn--sm"
                      [style.display]="cupomPromocional() ? 'block' : 'none'">
                      ✕
                    </button>
                  </div>
                  @if (cupomPromocional()) {
                    <p class="cupom-info" style="color: var(--verde)">
                      ✓ Cupom aplicado: -{{ cupomPromocional()?.valor | currency:'BRL' }}
                    </p>
                  }
                  @if (erroCupom()) {
                    <p class="cupom-info" style="color: var(--laranja)">{{ erroCupom() }}</p>
                  }
                </div>

                <!-- Cupons de troca -->
                <div class="cupom-section" style="margin-top: 16px">
                  <label style="font-size: .75rem; color: var(--mudo); display: block; margin-bottom: 6px">
                    Cupons de troca disponíveis
                  </label>
                  @for (cupom of cuponsTrocaDisponiveis(); track cupom.codigo) {
                    <label class="cupom-troca-option" [class.cupom-troca-option--selected]="cuponsTrocaSelecionados().some(c => c.codigo === cupom.codigo)">
                      <input
                        type="checkbox"
                        [checked]="cuponsTrocaSelecionados().some(c => c.codigo === cupom.codigo)"
                        (change)="toggleCupomTroca(cupom)">
                      <span>{{ cupom.codigo }} - {{ cupom.valor | currency:'BRL' }}</span>
                    </label>
                  }
                  @if (cuponsTrocaSelecionados().length > 0) {
                    <p class="cupom-info" style="color: var(--verde); margin-top: 8px">
                      ✓ Total em cupons: -{{ cuponsTrocaSelecionados().reduce((acc, c) => acc + c.valor, 0) | currency:'BRL' }}
                    </p>
                  }
                </div>
              </div>

              <!-- Cartões -->
              <div>
                <h4 style="font-size: .85rem; font-weight: 700; margin-bottom: 12px">
                  Cartões de crédito (RN0034: mínimo R$ 10,00 por cartão)
                </h4>

                @for (pagamento of pagamentosCartao(); track pagamento.cartaoId ?? $index) {
                  <div class="cartao-pagamento">
                    <div class="cartao-pagamento__info">
                      <select
                        [value]="pagamento.cartaoId ?? ''"
                        (change)="atualizarCartaoPagamento($index, $event)">
                        <option value="">Selecione um cartão</option>
                        @for (cartao of cartoes(); track cartao.id) {
                          <option [value]="cartao.id">{{ cartao.bandeira }} · {{ cartao.numero }}</option>
                        }
                        <option value="NOVO">+ Novo cartão</option>
                      </select>
                    </div>
                    <div class="cartao-pagamento__valor">
                      <label>Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        [value]="pagamento.valor"
                        (input)="atualizarValorCartao($index, $event)"
                        placeholder="0,00">
                    </div>
                    @if (pagamentosCartao().length > 1) {
                      <button (click)="removerCartaoPagamento($index)" class="btn btn--danger btn--sm">✕</button>
                    }
                  </div>
                }

                <button (click)="adicionarCartaoPagamento()" class="btn btn--secondary btn--sm" style="margin-top: 12px">
                  + Adicionar cartão
                </button>
              </div>

              @if (erroPagamento()) {
                <div class="alert alert--danger" style="margin-top: 16px">
                  {{ erroPagamento() }}
                </div>
              }
            </div>
          </div>

          <!-- Resumo -->
          <div class="card" style="position: sticky; top: 80px">
            <div class="card__header">
              <span class="card__titulo">Resumo do Pedido</span>
            </div>

            <!-- Itens -->
            <div style="margin-bottom: 16px">
              @for (item of itens(); track item.produto.id) {
                <div class="resumo-item">
                  <span>{{ item.quantidade }}x {{ item.produto.nome }}</span>
                  <span>{{ (item.precoUnitario * item.quantidade) | currency:'BRL' }}</span>
                </div>
              }
            </div>

            <div class="resumo-linha">
              <span>Subtotal</span>
              <span>{{ totais.subtotal | currency:'BRL' }}</span>
            </div>

            @if (totais.descontoPromocional > 0) {
              <div class="resumo-linha resumo-linha--desconto">
                <span>Cupom promocional</span>
                <span>-{{ totais.descontoPromocional | currency:'BRL' }}</span>
              </div>
            }

            @if (totais.descontoTroca > 0) {
              <div class="resumo-linha resumo-linha--desconto">
                <span>Cupons de troca</span>
                <span>-{{ totais.descontoTroca | currency:'BRL' }}</span>
              </div>
            }

            <div class="resumo-linha">
              <span>Frete ({{ freteSelecionado()?.nome ?? 'Não selecionado' }})</span>
              <span>{{ (freteSelecionado()?.valor ?? 0) | currency:'BRL' }}</span>
            </div>

            <div class="resumo-total">
              <span>Total</span>
              <span>{{ totalFinal() | currency:'BRL' }}</span>
            </div>

            <button
              (click)="finalizarCompra()"
              class="btn btn--primary btn--full btn--lg"
              style="margin-top: 20px"
              [disabled]="!podeFinalizar() || finalizando()">
              @if (finalizando()) {
                <span class="spinner" style="width:14px;height:14px;border-top-color:var(--preto)"></span>
                Processando…
              } @else {
                Finalizar Compra (RF0037)
              }
            </button>

            @if (!podeFinalizar() && !finalizando()) {
              <p style="font-size: .75rem; color: var(--laranja); margin-top: 12px; text-align: center">
                Selecione endereço, frete e forma de pagamento.
              </p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .step-badge {
      width: 28px;
      height: 28px;
      background: var(--borda);
      color: var(--mudo);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .8rem;
      font-weight: 700;
    }
    .step-badge--active {
      background: var(--acento);
      color: var(--preto);
    }

    .enderecos-lista, .frete-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .endereco-option, .frete-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: var(--painel);
      border: 1px solid var(--borda);
      border-radius: 4px;
      cursor: pointer;
      transition: border-color .2s;
    }
    .endereco-option:hover, .frete-option:hover {
      border-color: var(--claro);
    }
    .endereco-option--selected, .frete-option--selected {
      border-color: var(--acento);
      background: rgba(232,255,0,.05);
    }
    .endereco-option input, .frete-option input {
      width: 18px;
      height: 18px;
      accent-color: var(--acento);
    }
    .endereco-option__content strong {
      font-size: .85rem;
    }
    .endereco-option__content p {
      font-size: .78rem;
      color: var(--mudo);
      line-height: 1.4;
    }
    .endereco-option__cep {
      font-family: monospace;
    }
    .frete-option__content strong {
      font-size: .85rem;
    }
    .frete-option__content p {
      font-size: .78rem;
      color: var(--mudo);
    }
    .frete-option__valor {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 1rem;
      margin-left: auto;
    }

    .cupom-section input {
      background: var(--painel);
      border: 1px solid var(--borda);
      color: var(--branco);
      padding: 8px 12px;
      border-radius: 3px;
      width: 100%;
    }
    .cupom-info {
      font-size: .78rem;
      margin-top: 6px;
    }

    .cupom-troca-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--painel);
      border: 1px solid var(--borda);
      border-radius: 3px;
      cursor: pointer;
      margin-bottom: 8px;
      font-size: .85rem;
    }
    .cupom-troca-option--selected {
      border-color: var(--verde);
      background: rgba(34,197,94,.08);
    }
    .cupom-troca-option input {
      width: 16px;
      height: 16px;
      accent-color: var(--verde);
    }

    .cartao-pagamento {
      display: grid;
      grid-template-columns: 1fr 120px auto;
      gap: 12px;
      align-items: end;
      padding: 12px;
      background: var(--painel);
      border: 1px solid var(--borda);
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .cartao-pagamento select, .cartao-pagamento input {
      background: var(--escuro);
      border: 1px solid var(--borda);
      color: var(--branco);
      padding: 8px 10px;
      border-radius: 3px;
      width: 100%;
    }
    .cartao-pagamento__valor label {
      font-size: .68rem;
      color: var(--mudo);
      display: block;
      margin-bottom: 4px;
    }

    .resumo-item {
      display: flex;
      justify-content: space-between;
      font-size: .82rem;
      color: var(--claro);
      padding: 6px 0;
      border-bottom: 1px dashed var(--borda);
    }

    .resumo-linha {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: .85rem;
      color: var(--claro);
    }
    .resumo-linha--desconto {
      color: var(--verde);
    }
    .resumo-total {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      margin-top: 8px;
      border-top: 1px solid var(--borda);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 1.3rem;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly authService = inject(AuthService);
  private readonly freteService = inject(FreteService);
  private readonly cupomService = inject(CupomService);
  private readonly vendaService = inject(VendaService);
  private readonly router = inject(Router);

  // Estado do carrinho
  itens = this.carrinhoService.itens;
  temItens = this.carrinhoService.temItens;
  state = this.carrinhoService.state;

  // Signals locais
  etapa = signal(1);
  carregandoEnderecos = signal(false);
  carregandoFrete = signal(false);
  finalizando = signal(false);

  enderecos = signal<Endereco[]>([]);
  enderecoSelecionado = signal<Endereco | null>(null);

  opcoesFrete = signal<OpcaoFrete[]>([]);
  freteSelecionado = signal<OpcaoFrete | null>(null);

  cartoes = signal<CartaoCredito[]>([]);
  pagamentosCartao = signal<PagamentoCartao[]>([{ cartaoId: undefined, valor: 0 }]);

  cuponsTrocaDisponiveis = signal<Cupom[]>([]);
  cuponsTrocaSelecionados = signal<Cupom[]>([]);
  cupomPromocional = signal<Cupom | null>(null);

  erroCupom = signal('');
  erroPagamento = signal('');

  // Computed
  get totais() {
    return this.carrinhoService.totais();
  }

  totalFinal = computed(() => {
    const t = this.totais;
    const frete = this.freteSelecionado()?.valor ?? 0;
    const descontoTroca = this.cuponsTrocaSelecionados().reduce((acc, c) => acc + c.valor, 0);
    return Math.max(0, t.subtotal - (this.cupomPromocional()?.valor ?? 0) + frete - descontoTroca);
  });

  podeFinalizar = computed(() => {
    const enderecoOk = this.enderecoSelecionado() !== null;
    const freteOk = this.freteSelecionado() !== null;
    const pagamentoOk = this.validarPagamento();
    return enderecoOk && freteOk && pagamentoOk && this.temItens();
  });

  ngOnInit(): void {
    this.carregarEnderecos();
    this.carregarCartoes();
    this.carregarCuponsTroca();
  }

  carregarEnderecos(): void {
    this.carregandoEnderecos.set(true);
    this.authService.getEnderecos().subscribe({
      next: (data) => {
        this.enderecos.set(data);
        this.carregandoEnderecos.set(false);
        if (data.length > 0) {
          this.selecionarEndereco(data[0]);
        }
      },
      error: () => this.carregandoEnderecos.set(false),
    });
  }

  carregarCartoes(): void {
    this.authService.getCartoes().subscribe({
      next: (data) => this.cartoes.set(data),
    });
  }

  carregarCuponsTroca(): void {
    this.cupomService.listarCuponsTroca(1).subscribe({
      next: (data) => this.cuponsTrocaDisponiveis.set(data),
    });
  }

  selecionarEndereco(end: Endereco): void {
    this.enderecoSelecionado.set(end);
    this.etapa.set(2);
    this.calcularFrete(end.cep);
  }

  calcularFrete(cep: string): void {
    this.carregandoFrete.set(true);
    this.freteService.calcular(cep, this.itens()).subscribe({
      next: (data) => {
        this.opcoesFrete.set(data);
        this.carregandoFrete.set(false);
        if (data.length > 0) {
          this.selecionarFrete(data[0]);
        }
      },
      error: () => this.carregandoFrete.set(false),
    });
  }

  selecionarFrete(frete: OpcaoFrete): void {
    this.freteSelecionado.set(frete);
    this.carrinhoService.setFrete(frete);
    this.etapa.set(3);
  }

  aplicarCupomPromocional(event: Event): void {
    const input = event.target as HTMLInputElement;
    const codigo = input.value.trim();
    if (!codigo) {
      this.cupomPromocional.set(null);
      this.erroCupom.set('');
      return;
    }

    this.cupomService.validarCupom(codigo).subscribe({
      next: (cupom) => {
        if (cupom && cupom.tipo === 'PROMOCIONAL') {
          this.cupomPromocional.set(cupom);
          this.erroCupom.set('');
        } else {
          this.cupomPromocional.set(null);
          this.erroCupom.set('Cupom inválido ou não é promocional.');
        }
      },
    });
  }

  removerCupomPromocional(): void {
    this.cupomPromocional.set(null);
    this.erroCupom.set('');
  }

  toggleCupomTroca(cupom: Cupom): void {
    const atual = this.cuponsTrocaSelecionados();
    const existe = atual.some(c => c.codigo === cupom.codigo);
    if (existe) {
      this.cuponsTrocaSelecionados.set(atual.filter(c => c.codigo !== cupom.codigo));
    } else {
      this.cuponsTrocaSelecionados.set([...atual, cupom]);
    }
  }

  adicionarCartaoPagamento(): void {
    this.pagamentosCartao.update(p => [...p, { cartaoId: undefined, valor: 0 }]);
  }

  removerCartaoPagamento(index: number): void {
    this.pagamentosCartao.update(p => p.filter((_, i) => i !== index));
  }

  atualizarCartaoPagamento(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    const pagamentos = [...this.pagamentosCartao()];

    if (value === 'NOVO') {
      // TODO: Modal para novo cartão
      return;
    }

    pagamentos[index] = {
      ...pagamentos[index],
      cartaoId: value ? Number(value) : undefined,
    };
    this.pagamentosCartao.set(pagamentos);
  }

  atualizarValorCartao(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    const pagamentos = [...this.pagamentosCartao()];
    pagamentos[index] = { ...pagamentos[index], valor: value };
    this.pagamentosCartao.set(pagamentos);
  }

  validarPagamento(): boolean {
    const pagamentos = this.pagamentosCartao();
    const totalCupons = this.cuponsTrocaSelecionados().reduce((acc, c) => acc + c.valor, 0);
    const totalComCupons = this.totalFinal();

    // Valida se todos os cartões têm cartãoId e valor
    for (const p of pagamentos) {
      if (!p.cartaoId && pagamentos.length > 1) {
        this.erroPagamento.set('Selecione um cartão para cada pagamento.');
        return false;
      }

      // RN0034: mínimo R$ 10 por cartão (exceto quando usar cupons junto)
      if (p.cartaoId && p.valor > 0 && p.valor < 10) {
        const totalCartoes = pagamentos.reduce((acc, p) => acc + (p.cartaoId ? p.valor : 0), 0);
        if (totalCupons === 0 || totalCartoes > 0) {
          this.erroPagamento.set('Valor mínimo por cartão: R$ 10,00 (RN0034).');
          return false;
        }
      }
    }

    // Valida se o total dos pagamentos cobre o valor total
    const totalPagoCartoes = pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0);
    const valorRestante = totalComCupons - totalCupons;

    if (totalPagoCartoes < valorRestante && totalPagoCartoes > 0) {
      this.erroPagamento.set(`Valor insuficiente. Faltam ${(valorRestante - totalPagoCartoes).toFixed(2)}.`);
      return false;
    }

    if (totalPagoCartoes > totalComCupons) {
      this.erroPagamento.set('Valor total dos cartões excede o valor da compra.');
      return false;
    }

    // Se não usou cartões, precisa ter cupons suficientes
    if (totalPagoCartoes === 0 && totalCupons < totalComCupons) {
      this.erroPagamento.set('Adicione forma de pagamento.');
      return false;
    }

    this.erroPagamento.set('');
    return true;
  }

  finalizarCompra(): void {
    if (!this.podeFinalizar()) return;

    this.finalizando.set(true);

    const cliente = this.authService.clienteAtual();
    const frete = this.freteSelecionado();
    const endereco = this.enderecoSelecionado();

    if (!cliente || !frete || !endereco) {
      this.finalizando.set(false);
      return;
    }

    const dto = {
      clienteId: cliente.id!,
      itens: this.itens().map(item => ({
        produtoId: item.produto.id,
        produtoNome: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      })),
      enderecoEntrega: endereco,
      frete: {
        tipo: frete.id,
        prazoDias: frete.prazoDias,
        valor: frete.valor,
      },
      pagamentosCartao: this.pagamentosCartao()
        .filter(p => p.cartaoId && p.valor > 0)
        .map(p => {
          const cartao = this.cartoes().find(c => c.id === p.cartaoId);
          return {
            cartaoId: p.cartaoId,
            bandeira: cartao?.bandeira,
            ultimosDigitos: cartao?.numero?.replace(/\D/g, '').slice(-4),
            valor: p.valor,
          };
        }),
      cupomPromocionalId: this.cupomPromocional()?.id,
      cuponsTrocaIds: this.cuponsTrocaSelecionados().map(c => c.id),
    };

    this.vendaService.finalizarCompra(dto).subscribe({
      next: (venda) => {
        this.carrinhoService.limpar();
        this.finalizando.set(false);
        this.router.navigate(['/pedido', venda.id], { state: { venda } });
      },
      error: () => {
        this.finalizando.set(false);
        this.erroPagamento.set('Erro ao processar compra. Tente novamente.');
      },
    });
  }
}
