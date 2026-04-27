import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-state">
      <div class="spinner"></div>
      @if (mensagem()) { <span>{{ mensagem() }}</span> }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  readonly mensagem = input('Carregando...');
}
