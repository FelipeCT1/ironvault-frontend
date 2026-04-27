import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import type { LoginRequest, LoginResponse, Cliente, CartaoCredito, Endereco } from '../models/cliente.model';

const SESSION_KEY = 'ironvault_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _clienteAtual = signal<LoginResponse | null>(null);

  readonly logado = computed(() => this._clienteAtual() !== null);
  readonly ehAdmin = computed(() => this._clienteAtual()?.papel === 'ADMIN');
  readonly papel = computed(() => this._clienteAtual()?.papel ?? null);
  readonly nomeCliente = computed(() => this._clienteAtual()?.nome ?? '');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        this._clienteAtual.set(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }

  login(email: string, senha: string) {
    console.log('[AuthService] login chamado');
    return this.http
      .post<LoginResponse>('/api/v1/auth/login', { email, senha } as LoginRequest)
      .pipe(
        tap((res) => {
          console.log('[AuthService] login sucesso', res);
          this._clienteAtual.set(res);
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(res));
        }),
      );
  }

  logout() {
    console.log('[AuthService] logout');
    return this.http.post('/api/v1/auth/logout', {}).pipe(
      tap(() => {
        this._clienteAtual.set(null);
        sessionStorage.removeItem(SESSION_KEY);
        this.router.navigate(['/login']);
      }),
    );
  }

  verificarSessao() {
    console.log('[AuthService] verificar sessao');
    return this.http.get<LoginResponse>('/api/v1/auth/me').pipe(
      tap((res) => {
        console.log('[AuthService] sessao ativa', res);
        this._clienteAtual.set(res);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(res));
      }),
      catchError((err) => {
        console.error('[AuthService] sessao inativa', err);
        this._clienteAtual.set(null);
        sessionStorage.removeItem(SESSION_KEY);
        return of(null);
      }),
    );
  }

  getEnderecos() {
    return this.http.get<Endereco[]>('/api/v1/auth/enderecos');
  }

  getCartoes() {
    return this.http.get<CartaoCredito[]>('/api/v1/auth/cartoes');
  }

  adicionarCartao(cartao: CartaoCredito) {
    return this.http.post<CartaoCredito>('/api/v1/auth/cartoes', cartao);
  }
}
