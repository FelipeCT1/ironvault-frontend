import { computed, Injectable, signal } from '@angular/core';
import type { ItemCarrinho, Cupom, OpcaoFrete, CarrinhoState, CarrinhoTotais } from '../models/carrinho.model';
import type { Endereco } from '../models/cliente.model';
import type { Produto } from '../models/produto.model';

const STORAGE_KEY = 'ironvault_carrinho';

function initialState(): CarrinhoState {
  return {
    itens: [],
    enderecoEntrega: null,
    freteSelecionado: null,
    cupomPromocional: null,
    cuponsTroca: [],
  };
}

function loadFromStorage(): CarrinhoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as CarrinhoState;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return initialState();
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private _state = signal<CarrinhoState>(loadFromStorage());

  readonly itens = computed(() => this._state().itens);
  readonly quantidadeItens = computed(() => this._state().itens.reduce((acc, i) => acc + i.quantidade, 0));
  readonly temItens = computed(() => this._state().itens.length > 0);
  readonly enderecoEntrega = computed(() => this._state().enderecoEntrega);
  readonly freteSelecionado = computed(() => this._state().freteSelecionado);
  readonly cupomPromocional = computed(() => this._state().cupomPromocional);
  readonly cuponsTroca = computed(() => this._state().cuponsTroca);

  readonly totais = computed<CarrinhoTotais>(() => {
    const state = this._state();
    const subtotal = state.itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0);
    const descontoPromocional = state.cupomPromocional ? Math.min(state.cupomPromocional.valor, subtotal) : 0;
    const descontoTroca = state.cuponsTroca.reduce((acc, c) => acc + c.valor, 0);
    const valorFrete = state.freteSelecionado?.valor ?? 0;
    const total = subtotal - descontoPromocional - descontoTroca + valorFrete;

    return {
      subtotal,
      descontoPromocional,
      descontoTroca,
      valorFrete,
      total,
      totalAPagar: Math.max(0, total),
    };
  });

  private salvarNoStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state()));
  }

  adicionarItem(produto: Produto, quantidade: number) {
    this._state.update((s) => {
      const existente = s.itens.find((i) => i.produto.id === produto.id);
      if (existente) {
        return {
          ...s,
          itens: s.itens.map((i) =>
            i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i,
          ),
        };
      }
      return {
        ...s,
        itens: [...s.itens, { produto, quantidade, precoUnitario: produto.preco }],
      };
    });
    this.salvarNoStorage();
  }

  alterarQuantidade(produtoId: number, quantidade: number) {
    if (quantidade < 1) return;
    this._state.update((s) => ({
      ...s,
      itens: s.itens.map((i) => (i.produto.id === produtoId ? { ...i, quantidade } : i)),
    }));
    this.salvarNoStorage();
  }

  removerItem(produtoId: number) {
    this._state.update((s) => ({
      ...s,
      itens: s.itens.filter((i) => i.produto.id !== produtoId),
    }));
    this.salvarNoStorage();
  }

  limpar() {
    this._state.set(initialState());
    localStorage.removeItem(STORAGE_KEY);
  }

  setEnderecoEntrega(endereco: Endereco) {
    this._state.update((s) => ({ ...s, enderecoEntrega: endereco }));
    this.salvarNoStorage();
  }

  setFrete(frete: OpcaoFrete) {
    this._state.update((s) => ({ ...s, freteSelecionado: frete }));
    this.salvarNoStorage();
  }

  setCupomPromocional(cupom: Cupom | null) {
    this._state.update((s) => ({ ...s, cupomPromocional: cupom }));
    this.salvarNoStorage();
  }

  adicionarCupomTroca(cupom: Cupom) {
    this._state.update((s) => ({
      ...s,
      cuponsTroca: [...s.cuponsTroca, cupom],
    }));
    this.salvarNoStorage();
  }

  removerCupomTroca(cupomId: number) {
    this._state.update((s) => ({
      ...s,
      cuponsTroca: s.cuponsTroca.filter((c) => c.id !== cupomId),
    }));
    this.salvarNoStorage();
  }

  validarEstoque(): boolean {
    return this._state().itens.every((i) => i.produto.estoque >= i.quantidade);
  }
}
