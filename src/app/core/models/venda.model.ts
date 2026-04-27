export type StatusVenda =
  | 'EM_PROCESSAMENTO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'EM_TROCA'
  | 'TROCA_AUTORIZADA'
  | 'TROCADO'
  | 'CANCELADA';

export interface ItemVenda {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}

export interface PagamentoCartao {
  cartaoId?: number;
  novoCartao?: {
    numero: string;
    nomeImpresso: string;
    bandeira: string;
    codigoSeguranca: string;
  };
  valor: number;
}

export interface FreteDTO {
  tipo: string;
  prazoDias: number;
  valor: number;
}

export interface EnderecoEntregaDTO {
  apelido: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface FinalizarCompraDTO {
  clienteId: number;
  itens: ItemCompraDTO[];
  enderecoEntrega: EnderecoEntregaDTO;
  frete: FreteDTO;
  pagamentosCartao: PagamentoCartao[];
  cupomPromocionalId?: number | null;
  cuponsTrocaIds?: number[] | null;
}

export interface ItemCompraDTO {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Venda {
  id: number;
  clienteId: number;
  clienteNome?: string;
  codigoPedido: string;
  itens: ItemVenda[];
  enderecoEntrega: EnderecoEntregaDTO;
  pagamentosCartao: PagamentoCartao[];
  freteTipo: string;
  fretePrazoDias: number;
  freteValor: number;
  cupomPromocionalId?: number;
  cupomPromocionalCodigo?: string;
  cuponsTrocaIds?: number[];
  subtotal: number;
  descontoPromocional: number;
  descontoTroca: number;
  valorFrete: number;
  total: number;
  status: StatusVenda;
  dataCriacao: string;
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
  CANCELADA: 'Cancelada',
};

export const STATUS_CORES: Record<StatusVenda, 'ativo' | 'inativo' | 'azul' | 'verde' | 'laranja' | 'roxo'> = {
  EM_PROCESSAMENTO: 'azul',
  APROVADA: 'verde',
  REPROVADA: 'laranja',
  EM_TRANSITO: 'roxo',
  ENTREGUE: 'verde',
  EM_TROCA: 'laranja',
  TROCA_AUTORIZADA: 'roxo',
  TROCADO: 'inativo',
  CANCELADA: 'inativo',
};
