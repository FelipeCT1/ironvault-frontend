import { Produto } from './produto.model';
import { Endereco } from './cliente.model';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  bloqueadoAte?: string;
}

export interface Cupom {
  id: number;
  codigo: string;
  tipo: 'PROMOCIONAL' | 'TROCA';
  valor: number;
  validoAte: string;
  clienteId?: number;
}

export interface OpcaoFrete {
  id: string;
  nome: string;
  prazoDias: number;
  valor: number;
}

export interface CarrinhoState {
  itens: ItemCarrinho[];
  enderecoEntrega: Endereco | null;
  freteSelecionado: OpcaoFrete | null;
  cupomPromocional: Cupom | null;
  cuponsTroca: Cupom[];
}

export interface CarrinhoTotais {
  subtotal: number;
  descontoPromocional: number;
  descontoTroca: number;
  valorFrete: number;
  total: number;
  totalAPagar: number;
}
