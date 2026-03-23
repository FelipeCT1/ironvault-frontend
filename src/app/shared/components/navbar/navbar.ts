import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="topbar">
      IRONVAULT · Sistema de Gestão · LES 1º/2026
    </div>
    <nav class="navbar">
      <a routerLink="/clientes" class="navbar-logo">
        IRON<span>VAULT</span>
      </a>
      <ul class="navbar-links">
        <li>
          <a routerLink="/clientes" routerLinkActive="active">
            👤 Clientes
          </a>
        </li>
        <li><span class="nav-soon">📦 Pedidos</span></li>
        <li><span class="nav-soon">🔄 Trocas</span></li>
        <li><span class="nav-soon">🤖 IA</span></li>
      </ul>
    </nav>
  `,
  styles: [`
    .topbar {
      background: var(--acento);
      color: var(--preto);
      text-align: center;
      padding: 6px;
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .05em;
    }
    .navbar {
      background: var(--preto);
      border-bottom: 1px solid var(--borda);
      display: flex;
      align-items: center;
      gap: 32px;
      padding: 0 32px;
      height: 56px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-logo {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 1.4rem;
      letter-spacing: .06em;
      text-transform: uppercase;
      text-decoration: none;
      color: var(--branco);
      flex-shrink: 0;
    }
    .navbar-logo span { color: var(--acento); }
    .navbar-links {
      display: flex;
      gap: 4px;
      list-style: none;
    }
    .navbar-links a {
      display: block;
      padding: 6px 14px;
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--mudo);
      text-decoration: none;
      border-radius: 3px;
      transition: color .2s, background .2s;
    }
    .navbar-links a:hover { color: var(--branco); background: rgba(255,255,255,.05); }
    .navbar-links a.active { color: var(--acento); background: rgba(232,255,0,.08); }
    .nav-soon {
      display: block;
      padding: 6px 14px;
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--borda);
      cursor: not-allowed;
    }
  `]
})
export class NavbarComponent {}