import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RecomendacaoService, type Mensagem, type ProdutoSugerido } from '../../../core/services/recomendacao.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';

type Aba = 'chat' | 'recomendados' | 'historico';

@Component({
  selector: 'app-ia-widget',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="ia-root">
      @if (aberto()) {
        <div class="ia-backdrop" (click)="fechar()"></div>
        <div class="ia-popup">
          <div class="ia-popup-header">
            <div class="ia-header-left">
              <span class="ia-header-icon">🤖</span>
              <div>
                <div class="ia-header-title">IronVault IA</div>
                <div class="ia-header-status">
                  <span class="ia-status-dot"></span>
                  Online
                </div>
              </div>
            </div>
            <div class="ia-header-actions">
              <button class="ia-header-btn" (click)="fechar()" title="Fechar">✕</button>
            </div>
          </div>

          <div class="ia-tabs">
            <button class="ia-tab" [class.active]="abaAtiva() === 'chat'" (click)="abaAtiva.set('chat')">💬 Chat</button>
            <button class="ia-tab" [class.active]="abaAtiva() === 'recomendados'" (click)="carregarRecomendados()">⭐ Pra Você</button>
            <button class="ia-tab" [class.active]="abaAtiva() === 'historico'" (click)="carregarHistorico()">📊 Histórico</button>
          </div>

          <div class="ia-body">
            @switch (abaAtiva()) {
              @case ('chat') {
                <div class="ia-chat-msgs" #scrollContainer>
                  @for (msg of mensagens(); track $index) {
                    <div class="ia-msg" [class.bot]="msg.tipo === 'bot'" [class.user]="msg.tipo === 'user'">
                      @if (msg.tipo === 'bot') {
                        <div class="ia-msg-label">🤖 IA</div>
                      }
                      <div class="ia-msg-text">{{ msg.texto }}</div>
                      @if (msg.produtos && msg.produtos.length > 0) {
                        <div class="ia-produtos">
                          @for (prod of msg.produtos; track prod.id) {
                            <button class="ia-produto-card" (click)="adicionarAoCarrinho(prod)" [class.added]="adicionandoId() === prod.id" [disabled]="adicionandoId() === prod.id">
                              <div class="ia-produto-info">
                                <div class="ia-produto-nome">{{ prod.nome }}</div>
                                <div class="ia-produto-cat">{{ prod.categoria }}</div>
                              </div>
                              @if (adicionandoId() === prod.id) {
                                <span class="ia-produto-added">✓</span>
                              } @else {
                                <span class="ia-produto-add">+</span>
                              }
                            </button>
                          }
                        </div>
                      }
                    </div>
                  }
                  @if (carregandoChat()) {
                    <div class="ia-msg bot">
                      <div class="ia-msg-label">🤖 IA</div>
                      <div class="ia-msg-text">
                        Pensando<span class="ia-dot">.</span><span class="ia-dot" style="animation-delay:0.2s">.</span><span class="ia-dot" style="animation-delay:0.4s">.</span>
                      </div>
                    </div>
                  }
                </div>
                <div class="ia-chat-input">
                  <input
                    type="text"
                    [ngModel]="inputTexto()"
                    (ngModelChange)="inputTexto.set($event)"
                    (keydown.enter)="enviar()"
                    placeholder="Pergunte sobre produtos..."
                    [disabled]="carregandoChat()"
                  />
                  <button class="ia-btn-send" (click)="enviar()" [disabled]="carregandoChat() || !inputTexto().trim()">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8l12-6-4 6 4 6-12-6z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div class="ia-sugestoes">
                  @for (sugestao of sugestoes(); track $index) {
                    <button class="ia-sugestao-btn" (click)="perguntaRapida(sugestao)" [disabled]="carregandoChat()">
                      {{ sugestao }}
                    </button>
                  }
                </div>
              }
              @case ('recomendados') {
                <div class="ia-grid-body">
                  @if (carregandoRecomendados()) {
                    <div class="ia-loading">Carregando recomendações...</div>
                  } @else if (produtosRecomendados().length === 0) {
                    <div class="ia-empty">
                      <div class="ia-empty-icon">🎯</div>
                      <div class="ia-empty-text">Converse com o assistente para receber recomendações.</div>
                    </div>
                  } @else {
                    <div class="ia-grid-2">
                      @for (prod of produtosRecomendados(); track prod.id) {
                        <button class="ia-prod-card" (click)="adicionarAoCarrinho(prod)" [class.added]="adicionandoId() === prod.id" [disabled]="adicionandoId() === prod.id">
                          <div class="ia-prod-badge">Recomendado</div>
                          <div class="ia-prod-emoji">🏋️</div>
                          <div class="ia-prod-nome">{{ prod.nome }}</div>
                          <div class="ia-prod-valor">{{ prod.preco | currency:'BRL':'symbol':'1.2-2' }}</div>
                          @if (adicionandoId() === prod.id) {
                            <span class="ia-prod-add-btn">✓ Adicionado</span>
                          } @else {
                            <span class="ia-prod-add-btn">+ Carrinho</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              }
              @case ('historico') {
                <div class="ia-grid-body">
                  @if (carregandoHistorico()) {
                    <div class="ia-loading">Analisando histórico...</div>
                  } @else if (produtosHistorico().length === 0) {
                    <div class="ia-empty">
                      <div class="ia-empty-icon">📊</div>
                      <div class="ia-empty-text">Faça compras para receber recomendações baseadas no seu perfil.</div>
                    </div>
                  } @else {
                    <div class="ia-grid-2">
                      @for (prod of produtosHistorico(); track prod.id) {
                        <button class="ia-prod-card" (click)="adicionarAoCarrinho(prod)" [class.added]="adicionandoId() === prod.id" [disabled]="adicionandoId() === prod.id">
                          <div class="ia-prod-badge hist">Histórico</div>
                          <div class="ia-prod-emoji">📦</div>
                          <div class="ia-prod-nome">{{ prod.nome }}</div>
                          <div class="ia-prod-valor">{{ prod.preco | currency:'BRL':'symbol':'1.2-2' }}</div>
                          @if (adicionandoId() === prod.id) {
                            <span class="ia-prod-add-btn">✓ Adicionado</span>
                          } @else {
                            <span class="ia-prod-add-btn">+ Carrinho</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>
      }

      <button class="ia-fab" (click)="toggle()" [class.active]="aberto()" title="Assistente IA">
        @if (aberto()) {
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        } @else {
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="4" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.8"/>
            <path d="M7 10h8M7 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="17" cy="17" r="4" fill="var(--preto)" stroke="currentColor" stroke-width="1.5"/>
            <path d="M17 15.5v3M15.5 17h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        }
      </button>
    </div>
  `,
  styles: [
    `
      .ia-root {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        font-family: 'Barlow', sans-serif;
      }

      .ia-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.35);
        backdrop-filter: blur(2px);
        animation: iaFadeIn 0.2s ease-out;
      }

      @keyframes iaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes iaSlideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes iaDotPulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }

      /* ── FAB ── */
      .ia-fab {
        position: relative;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 1.5px solid var(--acento);
        background: var(--preto);
        color: var(--acento);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s ease;
        box-shadow: 0 2px 16px rgba(232, 255, 0, 0.15), 0 0 40px rgba(232, 255, 0, 0.05);
      }
      .ia-fab:hover {
        transform: scale(1.06);
        box-shadow: 0 2px 24px rgba(232, 255, 0, 0.3), 0 0 60px rgba(232, 255, 0, 0.08);
        background: var(--painel);
      }
      .ia-fab.active {
        background: var(--escuro);
        border-color: var(--mudo);
        color: var(--mudo);
        box-shadow: none;
      }
      .ia-fab.active:hover {
        border-color: var(--claro);
        color: var(--claro);
      }

      /* ── POPUP ── */
      .ia-popup {
        position: fixed;
        bottom: 92px;
        right: 24px;
        width: 380px;
        max-height: 580px;
        background: var(--escuro);
        border: 1px solid var(--borda);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 40px rgba(0,0,0,0.5);
        animation: iaSlideUp 0.2s ease-out;
        overflow: hidden;
      }
      .ia-popup::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--acento), transparent);
        opacity: 0.4;
      }

      /* ── HEADER ── */
      .ia-popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 10px;
        flex-shrink: 0;
      }
      .ia-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ia-header-icon {
        font-size: 1.3rem;
        line-height: 1;
      }
      .ia-header-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 800;
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--branco);
        line-height: 1.2;
      }
      .ia-header-status {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.62rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--mudo);
      }
      .ia-status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--verde);
        box-shadow: 0 0 6px var(--verde);
        animation: iaDotPulse 2s ease-in-out infinite;
      }
      .ia-header-btn {
        background: none;
        border: 1px solid var(--borda);
        color: var(--mudo);
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .ia-header-btn:hover {
        border-color: var(--claro);
        color: var(--branco);
      }

      /* ── TABS ── */
      .ia-tabs {
        display: flex;
        gap: 2px;
        padding: 0 16px;
        flex-shrink: 0;
      }
      .ia-tab {
        flex: 1;
        padding: 7px 8px;
        border: none;
        border-bottom: 2px solid transparent;
        background: none;
        color: var(--mudo);
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ia-tab:hover {
        color: var(--claro);
      }
      .ia-tab.active {
        color: var(--acento);
        border-bottom-color: var(--acento);
      }

      /* ── BODY ── */
      .ia-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      /* ── CHAT MSGS ── */
      .ia-chat-msgs {
        flex: 1;
        overflow-y: auto;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        scrollbar-width: thin;
        scrollbar-color: var(--borda) transparent;
      }
      .ia-chat-msgs::-webkit-scrollbar {
        width: 3px;
      }
      .ia-chat-msgs::-webkit-scrollbar-thumb {
        background: var(--borda);
        border-radius: 2px;
      }

      .ia-msg {
        max-width: 88%;
        animation: iaFadeIn 0.25s ease-out;
      }
      .ia-msg.bot {
        align-self: flex-start;
      }
      .ia-msg.user {
        align-self: flex-end;
      }
      .ia-msg-label {
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--acento);
        margin-bottom: 3px;
      }
      .ia-msg-text {
        font-size: 0.8rem;
        line-height: 1.5;
        color: var(--claro);
        white-space: pre-wrap;
      }
      .ia-msg.user .ia-msg-text {
        color: var(--branco);
        background: var(--painel);
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid var(--borda);
      }
      .ia-msg.bot .ia-msg-text {
        padding: 0;
      }
      .ia-dot {
        animation: iaDotPulse 1.4s ease-in-out infinite;
      }

      /* ── PRODUTOS INLINE ── */
      .ia-produtos {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ia-produto-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 10px;
        background: var(--painel);
        border: 1px solid var(--borda);
        border-radius: 4px;
        text-decoration: none;
        transition: all 0.2s ease;
      }
      .ia-produto-card {
        cursor: pointer;
        font-family: inherit;
        width: 100%;
        text-align: left;
      }
      .ia-produto-card:hover {
        border-color: var(--acento);
      }
      .ia-produto-card.added {
        border-color: var(--verde);
        background: rgba(34, 197, 94, 0.08);
      }
      .ia-produto-card:disabled {
        cursor: default;
      }
      .ia-produto-info {
        flex: 1;
        min-width: 0;
      }
      .ia-produto-nome {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.78rem;
        text-transform: uppercase;
        color: var(--branco);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ia-produto-cat {
        font-size: 0.62rem;
        color: var(--mudo);
        margin-top: 1px;
      }
      .ia-produto-add {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 900;
        font-size: 0.85rem;
        color: var(--acento);
        flex-shrink: 0;
      }
      .ia-produto-added {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 900;
        font-size: 0.85rem;
        color: var(--verde);
        flex-shrink: 0;
      }

      /* ── CHAT INPUT ── */
      .ia-chat-input {
        display: flex;
        gap: 6px;
        padding: 8px 16px;
        border-top: 1px solid var(--borda);
        flex-shrink: 0;
      }
      .ia-chat-input input {
        flex: 1;
        background: var(--preto);
        border: 1px solid var(--borda);
        border-radius: 4px;
        color: var(--branco);
        padding: 8px 10px;
        font-size: 0.78rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
      }
      .ia-chat-input input:focus {
        border-color: var(--acento);
      }
      .ia-chat-input input::placeholder {
        color: var(--mudo);
      }
      .ia-btn-send {
        width: 34px;
        height: 34px;
        border-radius: 4px;
        border: 1px solid var(--acento);
        background: var(--acento);
        color: var(--preto);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s ease;
      }
      .ia-btn-send:hover:not(:disabled) {
        background: transparent;
        color: var(--acento);
      }
      .ia-btn-send:disabled {
        opacity: 0.35;
        cursor: not-allowed;
        border-color: var(--borda);
        background: var(--painel);
        color: var(--mudo);
      }

      /* ── SUGESTOES ── */
      .ia-sugestoes {
        display: flex;
        gap: 6px;
        padding: 8px 16px 12px;
        flex-wrap: wrap;
        flex-shrink: 0;
        border-top: 1px solid var(--borda);
      }
      .ia-sugestao-btn {
        padding: 4px 10px;
        border-radius: 3px;
        border: 1px solid var(--borda);
        background: var(--preto);
        color: var(--mudo);
        font-family: 'Barlow', sans-serif;
        font-size: 0.68rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .ia-sugestao-btn:hover:not(:disabled) {
        border-color: var(--acento);
        color: var(--acento);
      }
      .ia-sugestao-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── GRID VIEW ── */
      .ia-grid-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        scrollbar-width: thin;
        scrollbar-color: var(--borda) transparent;
      }
      .ia-grid-body::-webkit-scrollbar {
        width: 3px;
      }
      .ia-grid-body::-webkit-scrollbar-thumb {
        background: var(--borda);
        border-radius: 2px;
      }
      .ia-loading {
        text-align: center;
        padding: 40px 16px;
        color: var(--mudo);
        font-size: 0.82rem;
      }
      .ia-empty {
        text-align: center;
        padding: 40px 16px;
      }
      .ia-empty-icon {
        font-size: 2rem;
        margin-bottom: 10px;
      }
      .ia-empty-text {
        color: var(--mudo);
        font-size: 0.8rem;
        line-height: 1.5;
      }
      .ia-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .ia-prod-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 12px 8px;
        background: var(--painel);
        border: 1px solid var(--borda);
        border-radius: 4px;
        text-decoration: none;
        transition: all 0.2s ease;
        position: relative;
      }
      .ia-prod-card {
        cursor: pointer;
        font-family: inherit;
        width: 100%;
      }
      .ia-prod-card:hover {
        border-color: var(--acento);
      }
      .ia-prod-card.added {
        border-color: var(--verde);
        background: rgba(34, 197, 94, 0.08);
      }
      .ia-prod-card:disabled {
        cursor: default;
      }
      .ia-prod-add-btn {
        margin-top: 6px;
        padding: 3px 10px;
        border-radius: 3px;
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.62rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--acento);
        color: var(--preto);
        transition: all 0.2s ease;
      }
      .ia-prod-card.added .ia-prod-add-btn {
        background: var(--verde);
        color: #fff;
      }
      .ia-prod-card .ia-prod-valor {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 900;
        font-size: 0.85rem;
        color: var(--acento);
      }
      .ia-prod-badge {
        position: absolute;
        top: 6px;
        left: 6px;
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.55rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 2px 6px;
        border-radius: 2px;
        background: var(--acento);
        color: var(--preto);
      }
      .ia-prod-badge.hist {
        background: var(--azul);
        color: #fff;
      }
      .ia-prod-emoji {
        font-size: 1.6rem;
        margin: 4px 0 6px;
      }
      .ia-prod-card .ia-prod-nome {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.72rem;
        text-transform: uppercase;
        color: var(--branco);
        line-height: 1.3;
        margin-bottom: 4px;
      }
      .ia-prod-card .ia-prod-preco {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 900;
        font-size: 0.85rem;
        color: var(--acento);
      }

      /* ── RESPONSIVE ── */
      @media (max-width: 480px) {
        .ia-popup {
          width: calc(100vw - 24px);
          right: 12px;
          bottom: 80px;
          max-height: 75vh;
        }
        .ia-root {
          right: 12px;
          bottom: 16px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IaWidgetComponent {
  private recomendacaoService = inject(RecomendacaoService);
  private carrinhoService = inject(CarrinhoService);
  private produtoService = inject(ProdutoService);

  protected aberto = signal(false);
  protected abaAtiva = signal<Aba>('chat');

  protected mensagens = signal<Mensagem[]>([]);
  protected inputTexto = signal('');
  protected carregandoChat = signal(false);
  protected sugestoes = signal<string[]>([
    'Qual o melhor suplemento para ganhar massa muscular?',
    'Preciso de um pré-treino estimulante',
    'Quero emagrecer mantendo músculo',
    'Diferença entre Whey Concentrado e Isolado',
  ]);

  protected produtosRecomendados = signal<ProdutoSugerido[]>([]);
  protected carregandoRecomendados = signal(false);

  protected produtosHistorico = signal<ProdutoSugerido[]>([]);
  protected carregandoHistorico = signal(false);

  protected adicionandoId = signal<number | null>(null);

  private primeiraAbertura = true;

  toggle() {
    if (this.aberto()) {
      this.fechar();
    } else {
      this.abrir();
    }
  }

  abrir() {
    this.aberto.set(true);
    if (this.primeiraAbertura && this.mensagens().length === 0) {
      this.mensagens.set([{
        tipo: 'bot',
        texto: 'Olá! Sou o assistente IronVault. Posso te ajudar a encontrar os melhores suplementos para seus objetivos. Pergunte sobre produtos, stacks ou tire dúvidas!',
      }]);
      this.primeiraAbertura = false;
    }
    this.abaAtiva.set('chat');
  }

  fechar() {
    this.aberto.set(false);
  }

  protected enviar() {
    const texto = this.inputTexto().trim();
    if (!texto || this.carregandoChat()) return;

    this.mensagens.update(msgs => [...msgs, { tipo: 'user', texto }]);
    this.inputTexto.set('');
    this.carregandoChat.set(true);

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
        this.carregandoChat.set(false);
      },
      error: () => {
        this.mensagens.update(msgs => [...msgs, {
          tipo: 'bot',
          texto: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
        }]);
        this.carregandoChat.set(false);
      },
    });
  }

  protected perguntaRapida(texto: string) {
    this.inputTexto.set(texto);
    this.enviar();
  }

  protected carregarRecomendados() {
    this.abaAtiva.set('recomendados');
    if (this.produtosRecomendados().length > 0) return;
    this.carregandoRecomendados.set(true);

    this.recomendacaoService.enviarMensagem(
      'Quais produtos você recomenda para mim hoje? Considere meu perfil e histórico.'
    ).subscribe({
      next: (res) => {
        this.produtosRecomendados.set(res.produtos);
        this.carregandoRecomendados.set(false);
      },
      error: () => this.carregandoRecomendados.set(false),
    });
  }

  protected carregarHistorico() {
    this.abaAtiva.set('historico');
    if (this.produtosHistorico().length > 0) return;
    this.carregandoHistorico.set(true);

    this.recomendacaoService.enviarMensagem(
      'Analise meu histórico de compras e recomende produtos similares ou complementares aos que já comprei.'
    ).subscribe({
      next: (res) => {
        this.produtosHistorico.set(res.produtos);
        this.carregandoHistorico.set(false);
      },
      error: () => this.carregandoHistorico.set(false),
    });
  }

  protected adicionarAoCarrinho(sugerido: ProdutoSugerido) {
    this.adicionandoId.set(sugerido.id);
    this.produtoService.buscarPorId(sugerido.id).subscribe({
      next: (produto) => {
        this.carrinhoService.adicionarItem(produto, 1);
        setTimeout(() => this.adicionandoId.set(null), 1200);
      },
      error: () => {
        this.adicionandoId.set(null);
      },
    });
  }
}
