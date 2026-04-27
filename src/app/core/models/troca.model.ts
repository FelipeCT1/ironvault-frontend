export type StatusTroca = 'SOLICITADA' | 'AUTORIZADA' | 'RECUSADA' | 'CONCLUIDA';

export interface Troca {
  id: number;
  codigoTroca: string;
  vendaId: number;
  clienteId: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  motivo: string;
  status: StatusTroca;
  valorCredito: number;
  cupomGeradoId?: number;
  valorFrete?: number;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface SolicitarTrocaDTO {
  vendaId: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  motivo: string;
  valorCredito: number;
}

export const STATUS_TROCA_LABELS: Record<StatusTroca, string> = {
  SOLICITADA: 'Solicitada',
  AUTORIZADA: 'Autorizada',
  RECUSADA: 'Recusada',
  CONCLUIDA: 'Concluída',
};

export const STATUS_TROCA_CORES: Record<StatusTroca, 'ativo' | 'inativo' | 'azul' | 'verde' | 'laranja' | 'roxo'> = {
  SOLICITADA: 'azul',
  AUTORIZADA: 'verde',
  RECUSADA: 'laranja',
  CONCLUIDA: 'roxo',
};
