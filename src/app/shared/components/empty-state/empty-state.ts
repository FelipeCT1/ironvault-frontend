import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">{{ icone() }}</div>
      <h3>{{ titulo() }}</h3>
      @if (sub()) { <p>{{ sub() }}</p> }
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icone = input('📦');
  readonly titulo = input('Nenhum item encontrado');
  readonly sub = input('');
}
