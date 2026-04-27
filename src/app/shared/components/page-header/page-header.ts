import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div>
        @if (rotulo()) { <div class="rotulo">{{ rotulo() }}</div> }
        <h2>{{ titulo() }}</h2>
        @if (sub()) { <p>{{ sub() }}</p> }
      </div>
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly rotulo = input('');
  readonly titulo = input.required<string>();
  readonly sub = input('');
}
