import { Injectable, signal, computed } from '@angular/core';
import { Cliente, Endereco, CartaoCredito } from '../models/cliente.model';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Cliente mockado - simula usuário logado
  private readonly _clienteAtual = signal<Cliente | null>(null);
  readonly clienteAtual = this._clienteAtual.asReadonly();

  readonly logado = computed(() => this._clienteAtual() !== null);

  constructor() {
    // Inicializa com cliente mockado
    this._clienteAtual.set(this.getClienteMock());
  }

  private getClienteMock(): Cliente {
    return {
      id: 1,
      nome: 'João Silva',
      genero: 'MASCULINO',
      dataNascimento: '1990-05-15',
      cpf: '123.456.789-00',
      email: 'joao.silva@email.com',
      ranking: 3,
      ativo: true,
      tipoTelefone: 'CELULAR',
      ddd: '11',
      numeroTelefone: '99999-8888',
      enderecos: [
        {
          id: 1,
          apelido: 'Casa',
          tipoResidencia: 'CASA',
          tipoLogradouro: 'RUA',
          logradouro: 'das Flores',
          numero: '123',
          bairro: 'Jardim Primavera',
          cep: '01310-100',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
          ehEntrega: true,
          ehCobranca: true,
        },
        {
          id: 2,
          apelido: 'Trabalho',
          tipoResidencia: 'COMERCIAL',
          tipoLogradouro: 'AVENIDA',
          logradouro: 'Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cep: '01310-100',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
          ehEntrega: true,
          ehCobranca: false,
        },
      ],
      cartoes: [
        {
          id: 1,
          numero: '4532 **** **** 1234',
          nomeImpresso: 'JOAO SILVA',
          bandeira: 'VISA',
          codigoSeguranca: '***',
          preferencial: true,
        },
        {
          id: 2,
          numero: '5500 **** **** 5678',
          nomeImpresso: 'JOAO SILVA',
          bandeira: 'MASTERCARD',
          codigoSeguranca: '***',
          preferencial: false,
        },
      ],
    };
  }

  getCliente(): Observable<Cliente> {
    return of(this._clienteAtual()!).pipe(delay(100));
  }

  getEnderecos(): Observable<Endereco[]> {
    return of(this._clienteAtual()?.enderecos ?? []).pipe(delay(50));
  }

  getCartoes(): Observable<CartaoCredito[]> {
    return of(this._clienteAtual()?.cartoes ?? []).pipe(delay(50));
  }

  adicionarEndereco(endereco: Endereco): Observable<Endereco> {
    const cliente = this._clienteAtual();
    if (!cliente) throw new Error('Cliente não logado');

    const novoEndereco = { ...endereco, id: Date.now() };
    cliente.enderecos = [...(cliente.enderecos ?? []), novoEndereco];
    this._clienteAtual.set({ ...cliente });

    return of(novoEndereco).pipe(delay(100));
  }

  adicionarCartao(cartao: CartaoCredito): Observable<CartaoCredito> {
    const cliente = this._clienteAtual();
    if (!cliente) throw new Error('Cliente não logado');

    const novoCartao = {
      ...cartao,
      id: Date.now(),
      numero: this.mascararCartao(cartao.numero),
      codigoSeguranca: '***',
    };
    cliente.cartoes = [...(cliente.cartoes ?? []), novoCartao];
    this._clienteAtual.set({ ...cliente });

    return of(novoCartao).pipe(delay(100));
  }

  private mascararCartao(numero: string): string {
    const digits = numero.replace(/\D/g, '');
    const first = digits.slice(0, 4);
    const last = digits.slice(-4);
    return `${first} **** **** ${last}`;
  }
}
