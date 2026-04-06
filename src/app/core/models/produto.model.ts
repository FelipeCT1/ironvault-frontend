export interface Dimensoes {
  altura: number;  // cm
  largura: number; // cm
  profundidade: number; // cm
}

export interface Produto {
  id: number;
  nome: string;
  marca: string;
  descricao: string;
  preco: number;
  precoPromocional?: number;
  categoria: string;
  imagemUrl: string;
  estoque: number;
  peso: number; // kg
  dimensoes: Dimensoes;
  controlado?: boolean;
  prescricaoObrigatoria?: boolean;
}

export interface FiltroProduto {
  nome?: string;
  categoria?: string;
}

export const CATEGORIAS = [
  'SUPLEMENTO',
  'ACESSORIO',
  'MEDICAMENTO_CONTROLADO',
] as const;

export type CategoriaProduto = typeof CATEGORIAS[number];
