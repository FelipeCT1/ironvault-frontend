import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IaChatComponent } from './ia-chat/ia-chat.component';
import { IaRecomendadosComponent } from './ia-recomendados/ia-recomendados.component';
import { IaHistoricoComponent } from './ia-historico/ia-historico.component';

type Aba = 'chat' | 'recomendados' | 'historico';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [IaChatComponent, IaRecomendadosComponent, IaHistoricoComponent],
  template: `
    <div class="tabs-bar">
      <button class="tab" [class.active]="abaAtiva() === 'chat'" (click)="abaAtiva.set('chat')">🤖 Assistente IA</button>
      <button class="tab" [class.active]="abaAtiva() === 'recomendados'" (click)="abaAtiva.set('recomendados')">⭐ Para Você</button>
      <button class="tab" [class.active]="abaAtiva() === 'historico'" (click)="abaAtiva.set('historico')">📊 Baseado no Histórico</button>
    </div>

    <div class="conteudo">
      <div class="page-header">
        <div>
          <div class="rotulo">RNF0044 · IA Generativa</div>
          <h2>Assistente IronVault</h2>
        </div>
      </div>

      @switch (abaAtiva()) {
        @case ('chat') {
          <app-ia-chat />
        }
        @case ('recomendados') {
          <app-ia-recomendados />
        }
        @case ('historico') {
          <app-ia-historico />
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IaComponent {
  protected readonly abaAtiva = signal<Aba>('chat');
}
