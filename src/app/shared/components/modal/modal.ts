import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (aberto()) {
      <div class="modal-overlay" (click)="fechar.emit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ titulo() }}</h3>
            <button class="btn-fechar-modal" (click)="fechar.emit()">✕</button>
          </div>
          <div class="modal-body">
            <ng-content />
          </div>
          @if (mostrarFooter()) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly aberto = input.required<boolean>();
  readonly titulo = input('');
  readonly mostrarFooter = input(false);
  readonly fechar = output<void>();
}
