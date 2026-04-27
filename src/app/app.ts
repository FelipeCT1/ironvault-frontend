import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CarrinhoService } from './core/services/carrinho.service';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { TopbarComponent } from './shared/components/topbar/topbar';
import { FooterComponent } from './shared/components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TopbarComponent, FooterComponent],
  template: `
    <app-topbar />
    <app-navbar />
    <main style="flex: 1;">
      <router-outlet />
    </main>
    <app-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly carrinho = inject(CarrinhoService);

  ngOnInit() {
    this.auth.verificarSessao().subscribe();
    this.carrinho.temItens();
  }


}
