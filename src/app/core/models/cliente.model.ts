export type Papel = 'CLIENTE' | 'ADMIN';
export type TipoTelefone = 'CELULAR' | 'FIXO';

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
  bandeira: string;
  ultimosDigitos?: string;
  nomeImpresso: string;
  preferencial: boolean;
  numero?: string;
  codigoSeguranca?: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  genero: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  senha?: string;
  ranking?: number;
  ativo?: boolean;
  papel?: Papel;
  tipoTelefone: TipoTelefone;
  ddd: string;
  numeroTelefone: string;
  enderecos?: Endereco[];
  cartoes?: CartaoCredito[];
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
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
