export interface Dimensoes {
  altura: number;
  largura: number;
  profundidade: number;
}

export interface Produto {
  id: number;
  nome: string;
  marca: string;
  descricao: string;
  preco: number;
  precoPromocional?: number;
  categoria: string;
  imagemUrl?: string;
  estoque: number;
  peso: number;
  dimensoes: Dimensoes;
  controlado?: boolean;
  prescricaoObrigatoria?: boolean;
}

export interface FiltroProduto {
  nome?: string;
  categoriaId?: number;
}

export const CATEGORIAS = ['SUPLEMENTO', 'ACESSORIO', 'MEDICAMENTO_CONTROLADO'];
