import { Endereco, CartaoCredito } from './cliente.model';
import { Cupom, OpcaoFrete } from './carrinho.model';

export type StatusVenda =
  | 'EM_PROCESSAMENTO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'EM_TROCA'
  | 'TROCA_AUTORIZADA'
  | 'TROCADO';

export interface ItemVenda {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}

export interface PagamentoCartao {
  cartaoId?: number;
  novoCartao?: CartaoCredito;
  valor: number;
}

export interface FreteDTO {
  tipo: string;
  prazoDias: number;
  valor: number;
}

export interface FinalizarCompraDTO {
  clienteId: number;
  itens: ItemVenda[];
  enderecoEntrega: Endereco;
  frete: FreteDTO;
  pagamentosCartao: { cartaoId?: number; bandeira?: string; ultimosDigitos?: string; valor: number }[];
  cupomPromocionalId?: number;
  cuponsTrocaIds: number[];
}

export interface Venda {
  id: number;
  clienteId: number;
  itens: ItemVenda[];
  enderecoEntrega: Endereco;
  frete: OpcaoFrete;
  pagamentosCartao: PagamentoCartao[];
  cupomPromocional: Cupom | null;
  cuponsTroca: Cupom[];
  subtotal: number;
  descontoPromocional: number;
  descontoTroca: number;
  valorFrete: number;
  total: number;
  status: StatusVenda;
  dataCriacao: string;
  codigoPedido: string; // ex: PED-0001
}

export const STATUS_LABELS: Record<StatusVenda, string> = {
  EM_PROCESSAMENTO: 'Em Processamento',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  EM_TRANSITO: 'Em Trânsito',
  ENTREGUE: 'Entregue',
  EM_TROCA: 'Em Troca',
  TROCA_AUTORIZADA: 'Troca Autorizada',
  TROCADO: 'Trocado',
};

export const STATUS_COLORS: Record<StatusVenda, string> = {
  EM_PROCESSAMENTO: 'azul',
  APROVADA: 'verde',
  REPROVADA: 'laranja',
  EM_TRANSITO: 'roxo',
  ENTREGUE: 'verde',
  EM_TROCA: 'laranja',
  TROCA_AUTORIZADA: 'azul',
  TROCADO: 'verde',
};
