import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="logo-f">IRON<span>VAULT</span></div>
      <span>© 2026 IRONVAULT · Suplementos de Alta Performance</span>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
