import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav>
      <a routerLink="/produtos" class="logo">IRON<span>VAULT</span></a>
      <div class="nav-links">
        <a routerLink="/produtos" class="nav-link">🏪 Loja</a>
        @if (auth.ehAdmin()) {
          <a routerLink="/clientes" class="nav-link">👤 Clientes</a>
        }
        @if (auth.logado() && !auth.ehAdmin()) {
          <a routerLink="/pedidos" class="nav-link">📦 Pedidos</a>
          <a routerLink="/trocas" class="nav-link">🔄 Trocas</a>
        }
        @if (auth.ehAdmin()) {
          <a routerLink="/admin/pedidos" class="nav-link">📦 Pedidos</a>
          <a routerLink="/admin/trocas" class="nav-link">🔄 Trocas</a>
        }
        <a routerLink="/ia" class="nav-link">🤖 IA</a>
        @if (auth.ehAdmin()) {
          <a routerLink="/admin" class="nav-link">⚙️ Admin</a>
        }
      </div>

      <div class="nav-acoes">
        <a routerLink="/carrinho" class="nav-btn" title="Carrinho">
          🛒
          @if (carrinho.quantidadeItens() > 0) {
            <span class="badge">{{ carrinho.quantidadeItens() }}</span>
          }
        </a>

        @if (auth.logado()) {
          <span>{{ auth.nomeCliente() }}</span>
          <button class="btn-login" (click)="logout()">Sair</button>
        } @else {
          <button class="btn-login" routerLink="/login">Minha Conta</button>
        }
      </div>
    </nav>
  `,
  styles: [
    `
      .nav-link {
        color: var(--mudo);
        text-decoration: none;
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .nav-link:hover {
        color: var(--claro);
        background-color: var(--painel);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly carrinho = inject(CarrinhoService);
  private readonly router = inject(Router);

  logout() {
    this.auth.logout().subscribe();
  }
}
