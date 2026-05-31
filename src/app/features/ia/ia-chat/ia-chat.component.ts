import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecomendacaoService, type Mensagem, type ProdutoSugerido } from '../../../core/services/recomendacao.service';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ia-chat',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  template: `
    <div class="chat-container" id="chatContainer">
      <div class="chat-msgs" #scrollContainer>
        @for (msg of mensagens(); track $index) {
          <div class="msg" [class.ia]="msg.tipo === 'bot'" [class.user]="msg.tipo === 'user'">
            @if (msg.tipo === 'bot') {
              <div class="msg-label">🤖 IRONVAULT IA</div>
            }
            {{ msg.texto }}
            @if (msg.produtos && msg.produtos.length > 0) {
              <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
                @for (prod of msg.produtos; track prod.id) {
                  <div style="display:flex;gap:10px;align-items:center;background:var(--painel);border:1px solid var(--borda);border-radius:3px;padding:8px 10px">
                    <div style="flex:1;min-width:0">
                      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.85rem;text-transform:uppercase">{{ prod.nome }}</div>
                      <div style="font-size:.7rem;color:var(--mudo);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ prod.categoria }}</div>
                    </div>
                    <div style="text-align:right;flex-shrink:0">
                      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.9rem">{{ prod.preco | currency:'BRL':'symbol':'1.2-2' }}</div>
                      <a [routerLink]="'/produtos'" class="btn btn-primary btn-sm" style="text-decoration:none;display:inline-block;margin-top:2px">Ver</a>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
        @if (carregando()) {
          <div class="msg ia">
            <div class="msg-label">🤖 IRONVAULT IA</div>
            <span style="opacity:0.6">Pensando</span><span style="opacity:0.6;animation:piscar 1.2s infinite">.</span><span style="opacity:0.6;animation:piscar 1.2s infinite 0.2s">.</span><span style="opacity:0.6;animation:piscar 1.2s infinite 0.4s">.</span>
          </div>
        }
      </div>
      <div class="chat-input">
        <input
          type="text"
          [ngModel]="inputTexto()"
          (ngModelChange)="inputTexto.set($event)"
          (keydown.enter)="enviar()"
          placeholder="Pergunte sobre produtos, dosagens, objetivos..."
          [disabled]="carregando()"
        />
        <button class="btn-send" (click)="enviar()" [disabled]="carregando() || !inputTexto().trim()">Enviar</button>
      </div>
    </div>
    <div style="margin-top:12px">
      <div style="font-size:.72rem;color:var(--mudo);margin-bottom:8px;font-weight:600;letter-spacing:.1em;text-transform:uppercase">Perguntas rápidas:</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        @for (sugestao of sugestoes(); track $index) {
          <button class="btn btn-secondary btn-sm" (click)="perguntaRapida(sugestao)" [disabled]="carregando()">{{ sugestao }}</button>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes piscar {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IaChatComponent {
  private recomendacaoService = inject(RecomendacaoService);

  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly carregando = signal(false);
  protected readonly inputTexto = signal('');
  protected readonly sugestoes = signal<string[]>([
    'Qual o melhor suplemento para ganhar massa muscular?',
    'Preciso de um pré-treino estimulante',
    'Quero emagrecer mantendo músculo',
    'Diferença entre Whey Concentrado e Isolado',
  ]);

  private mensagemInicialExibida = false;

  ngAfterViewInit() {
    if (!this.mensagemInicialExibida) {
      this.mensagens.set([{
        tipo: 'bot',
        texto: 'Olá! Sou o assistente IronVault. Posso te ajudar a encontrar os melhores suplementos para seus objetivos. Pergunte sobre produtos, stacks ou tire dúvidas!'
      }]);
      this.mensagemInicialExibida = true;
    }
  }

  protected enviar() {
    const texto = this.inputTexto().trim();
    if (!texto || this.carregando()) return;

    this.mensagens.update(msgs => [...msgs, { tipo: 'user', texto }]);
    this.inputTexto.set('');
    this.carregando.set(true);

    this.recomendacaoService.enviarMensagem(texto).subscribe({
      next: (res) => {
        this.mensagens.update(msgs => [...msgs, {
          tipo: 'bot',
          texto: res.resposta,
          produtos: res.produtos,
        }]);
        if (res.sugestoes && res.sugestoes.length > 0) {
          this.sugestoes.set(res.sugestoes);
        }
        this.carregando.set(false);
      },
      error: () => {
        this.mensagens.update(msgs => [...msgs, {
          tipo: 'bot',
          texto: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.'
        }]);
        this.carregando.set(false);
      }
    });
  }

  protected perguntaRapida(texto: string) {
    this.inputTexto.set(texto);
    this.enviar();
  }
}
