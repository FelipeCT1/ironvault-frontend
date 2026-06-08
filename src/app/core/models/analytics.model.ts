export interface DadosMensais {
  anoMes: string;
  quantidade: number;
}

export interface VendasPorCategoria {
  categoriaId: number;
  categoriaNome: string;
  dados: DadosMensais[];
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}
