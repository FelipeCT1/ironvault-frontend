import { Injectable, signal, computed } from '@angular/core';
import { Produto } from '../models/produto.model';
import {
  ItemCarrinho,
  CarrinhoState,
  CarrinhoTotais,
  Cupom,
  OpcaoFrete,
} from '../models/carrinho.model';
import { Endereco } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly _state = signal<CarrinhoState>({
    itens: [],
    enderecoEntrega: null,
    freteSelecionado: null,
    cupomPromocional: null,
    cuponsTroca: [],
  });

  readonly state = this._state.asReadonly();

  // Computed values
  readonly itens = computed(() => this._state().itens);
  readonly quantidadeItens = computed(() =>
    this._state().itens.reduce((acc, item) => acc + item.quantidade, 0)
  );
  readonly temItens = computed(() => this._state().itens.length > 0);

  readonly totais = computed<CarrinhoTotais>(() => {
    const state = this._state();
    const subtotal = state.itens.reduce(
      (acc, item) => acc + item.precoUnitario * item.quantidade,
      0
    );

    const descontoPromocional = state.cupomPromocional?.valor ?? 0;
    const descontoTroca = state.cuponsTroca.reduce((acc, c) => acc + c.valor, 0);
    const valorFrete = state.freteSelecionado?.valor ?? 0;

    const total = subtotal - descontoPromocional + valorFrete;
    const totalAPagar = Math.max(0, total - descontoTroca);

    return {
      subtotal,
      descontoPromocional,
      descontoTroca,
      valorFrete,
      total,
      totalAPagar,
    };
  });

  // Métodos do carrinho
  adicionarItem(produto: Produto, quantidade: number = 1): void {
    const state = this._state();
    const existingIndex = state.itens.findIndex(
      (item) => item.produto.id === produto.id
    );

    if (existingIndex >= 0) {
      // Atualiza quantidade
      const itens = [...state.itens];
      itens[existingIndex] = {
        ...itens[existingIndex],
        quantidade: itens[existingIndex].quantidade + quantidade,
      };
      this._state.update((s) => ({ ...s, itens }));
    } else {
      // Adiciona novo item
      const novoItem: ItemCarrinho = {
        produto,
        quantidade,
        precoUnitario: produto.precoPromocional ?? produto.preco,
      };
      this._state.update((s) => ({
        ...s,
        itens: [...s.itens, novoItem],
      }));
    }

    this.salvarNoStorage();
  }

  alterarQuantidade(produtoId: number, quantidade: number): void {
    if (quantidade <= 0) {
      this.removerItem(produtoId);
      return;
    }

    this._state.update((s) => ({
      ...s,
      itens: s.itens.map((item) =>
        item.produto.id === produtoId ? { ...item, quantidade } : item
      ),
    }));

    this.salvarNoStorage();
  }

  removerItem(produtoId: number): void {
    this._state.update((s) => ({
      ...s,
      itens: s.itens.filter((item) => item.produto.id !== produtoId),
    }));

    this.salvarNoStorage();
  }

  limpar(): void {
    this._state.set({
      itens: [],
      enderecoEntrega: null,
      freteSelecionado: null,
      cupomPromocional: null,
      cuponsTroca: [],
    });

    this.salvarNoStorage();
  }

  // Endereço de entrega
  setEnderecoEntrega(endereco: Endereco): void {
    this._state.update((s) => ({
      ...s,
      enderecoEntrega: endereco,
    }));
  }

  // Frete
  setFrete(frete: OpcaoFrete): void {
    this._state.update((s) => ({
      ...s,
      freteSelecionado: frete,
    }));
  }

  // Cupons
  setCupomPromocional(cupom: Cupom | null): void {
    this._state.update((s) => ({
      ...s,
      cupomPromocional: cupom,
    }));
  }

  adicionarCupomTroca(cupom: Cupom): void {
    this._state.update((s) => {
      // Verifica se já existe
      if (s.cuponsTroca.some((c) => c.codigo === cupom.codigo)) {
        return s;
      }
      return {
        ...s,
        cuponsTroca: [...s.cuponsTroca, cupom],
      };
    });
  }

  removerCupomTroca(codigo: string): void {
    this._state.update((s) => ({
      ...s,
      cuponsTroca: s.cuponsTroca.filter((c) => c.codigo !== codigo),
    }));
  }

  // Validações
  validarEstoque(produtoId: number, quantidade: number): boolean {
    const state = this._state();
    const item = state.itens.find((i) => i.produto.id === produtoId);
    if (!item) return true;
    return item.produto.estoque >= quantidade;
  }

  private salvarNoStorage(): void {
    try {
      const state = this._state();
      localStorage.setItem('carrinho', JSON.stringify(state));
    } catch {
      // Ignora erros de storage
    }
  }

  carregarDoStorage(): void {
    try {
      const data = localStorage.getItem('carrinho');
      if (data) {
        const parsed = JSON.parse(data);
        this._state.set(parsed);
      }
    } catch {
      // Ignora erros de storage
    }
  }
}
