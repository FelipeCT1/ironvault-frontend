import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AlertComponent],
  template: `
    <div class="conteudo" style="max-width: 400px; margin: 80px auto;">
      <div class="card">
        <h1 class="card-titulo" style="text-align: center; margin-bottom: 4px;">
          Entrar
        </h1>
        <p style="text-align: center; color: var(--mudo); margin-bottom: 24px; font-size: 13px;">
          Acesse sua conta IronVault
        </p>

        @if (erro()) {
          <app-alert tipo="danger" [mensagem]="erro()" />
        }

        <form #form="ngForm" (ngSubmit)="submit()">
          <div class="campo">
            <label class="rotulo" for="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              class="form-control"
              placeholder="seu@email.com"
              [(ngModel)]="email"
              required
              #emailField="ngModel"
            />
            @if (emailField.invalid && emailField.touched) {
              <span class="form-error">E-mail obrigatório</span>
            }
          </div>

          <div class="campo">
            <label class="rotulo" for="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              class="form-control"
              placeholder="Sua senha"
              [(ngModel)]="senha"
              required
              #senhaField="ngModel"
            />
            @if (senhaField.invalid && senhaField.touched) {
              <span class="form-error">Senha obrigatória</span>
            }
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 16px;" [disabled]="carregando()">
            @if (carregando()) {
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
                Entrando...
              </div>
            } @else {
              Entrar
            }
          </button>
        </form>

        <div style="margin-top: 24px; padding: 12px; background-color: var(--escuro); border-radius: 8px; font-size: 12px; color: var(--mudo);">
          <strong style="color: var(--claro);">Contas de teste:</strong><br />
          admin@ironvault.com / admin123 (Admin)<br />
          joao.silva@email.com / 123456 (Cliente)
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected senha = '';
  protected erro = signal('');
  protected carregando = signal(false);

  submit() {
    if (!this.email || !this.senha) {
      console.log('[Login] campos vazios');
      return;
    }

    this.carregando.set(true);
    this.erro.set('');
    console.log('[Login] enviando', this.email);

    this.auth.login(this.email, this.senha).subscribe({
      next: () => {
        console.log('[Login] sucesso, navegando');
        this.router.navigate(['/produtos']);
      },
      error: (err) => {
        console.error('[Login] erro:', err);
        this.erro.set(err.message || 'Credenciais inválidas');
        this.carregando.set(false);
      },
    });
  }
}
