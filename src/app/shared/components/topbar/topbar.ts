import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `<div class="topbar">IRONVAULT · Suplementos de Alta Performance · Frete grátis acima de R$199</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {}
