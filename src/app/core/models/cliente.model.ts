export interface Endereco {
  id?: number;
  apelido: string;
  tipoResidencia: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
  observacoes?: string;
  ehEntrega: boolean;
  ehCobranca: boolean;
}

export interface CartaoCredito {
  id?: number;
  numero: string;
  nomeImpresso: string;
  bandeira: string;
  codigoSeguranca: string;
  preferencial: boolean;
}

export interface Cliente {
  id?: number;
  nome: string;
  genero: string;
  dataNascimento: string; // LocalDate → string ISO 'YYYY-MM-DD'
  cpf: string;
  email: string;
  senha?: string;
  ranking?: number;
  ativo?: boolean;
  tipoTelefone: string;
  ddd: string;
  numeroTelefone: string;
  enderecos?: Endereco[];
  cartoes?: CartaoCredito[];
}

export interface AlterarSenhaDTO {
  novaSenha: string;
  confirmacaoSenha: string;
}

export interface FiltroCliente {
  nome?: string;
  cpf?: string;
  email?: string;
}