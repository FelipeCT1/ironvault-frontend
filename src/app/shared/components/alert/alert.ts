import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: `
    @if (mensagem()) {
      <div class="alert alert-{{ tipo() }}">
        @if (icone()) { <span>{{ icone() }}</span> }
        <span>{{ mensagem() }}</span>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  readonly tipo = input<'info' | 'success' | 'warn' | 'danger'>('info');
  readonly mensagem = input('');
  readonly icone = input('');
}
