import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="status s-{{ cor() }}">{{ label() }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly cor = input<'ativo' | 'inativo' | 'azul' | 'verde' | 'laranja' | 'roxo'>('azul');
}
