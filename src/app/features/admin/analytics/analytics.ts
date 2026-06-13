import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  afterNextRender,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { VendaService } from '../../../core/services/venda.service';
import type { Categoria } from '../../../core/models/analytics.model';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Legend, Tooltip, Filler);

const CORES_CATEGORIAS = ['#e8ff00', '#3b82f6', '#ff4d00', '#a855f7', '#22c55e', '#f43f5e'];

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="analytics-page">
      <div class="analytics-header">
        <div class="analytics-header-left">
          <span class="analytics-badge">📊 Analytics</span>
          <h1 class="analytics-title">Análise de Vendas</h1>
          <p class="analytics-subtitle">Volume de itens vendidos por categoria ao longo do tempo</p>
        </div>
        <div class="analytics-header-meta">
          <div class="meta-dot"></div>
          <span>{{ categorias().length }} categorias</span>
        </div>
      </div>

      <div class="controls-panel">
        <div class="controls-row">
          <div class="control-group">
            <label class="control-label">
              <span class="control-icon">📅</span>
              Período
            </label>
            <div class="date-range">
              <div class="date-field">
                <input type="date" [(ngModel)]="dataInicio" />
                <span class="date-arrow">→</span>
              </div>
              <div class="date-field">
                <input type="date" [(ngModel)]="dataFim" />
              </div>
            </div>
          </div>

          <div class="control-group control-group-cats">
            <label class="control-label">
              <span class="control-icon">🏷️</span>
              Categorias
            </label>
            <div class="category-pills">
              @for (cat of categorias(); track cat.id) {
                <button
                  class="cat-pill"
                  [class.active]="categoriasSelecionadas().has(cat.id)"
                  (click)="toggleCategoria(cat.id)"
                  [style.--pill-color]="CORES_CATEGORIAS[$index % CORES_CATEGORIAS.length]"
                >
                  <span class="pill-dot"></span>
                  {{ cat.nome }}
                </button>
              }
            </div>
          </div>

          <button class="generate-btn" (click)="carregarGrafico()" [disabled]="carregando()">
            @if (carregando()) {
              <span class="btn-spinner"></span>
              Gerando...
            } @else {
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Gerar Gráfico
            }
          </button>
        </div>
      </div>

      @if (erro()) {
        <div class="error-bar">{{ erro() }}</div>
      }

      <div class="chart-container">
        @if (semDados() && !carregando()) {
          <div class="empty-state">
            <div class="empty-graphic">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="10" y="50" width="12" height="20" rx="2" stroke="var(--mudo)" stroke-width="2" opacity="0.3"/>
                <rect x="28" y="35" width="12" height="35" rx="2" stroke="var(--mudo)" stroke-width="2" opacity="0.3"/>
                <rect x="46" y="25" width="12" height="45" rx="2" stroke="var(--mudo)" stroke-width="2" opacity="0.3"/>
                <rect x="64" y="40" width="12" height="30" rx="2" stroke="var(--mudo)" stroke-width="2" opacity="0.3"/>
                <line x1="8" y1="72" x2="78" y2="72" stroke="var(--mudo)" stroke-width="1" opacity="0.3"/>
                <line x1="10" y1="72" x2="10" y2="10" stroke="var(--mudo)" stroke-width="1" opacity="0.3"/>
                <circle cx="16" cy="50" r="2" fill="var(--mudo)" opacity="0.3"/>
                <circle cx="34" cy="35" r="2" fill="var(--mudo)" opacity="0.3"/>
                <circle cx="52" cy="25" r="2" fill="var(--mudo)" opacity="0.3"/>
                <circle cx="70" cy="40" r="2" fill="var(--mudo)" opacity="0.3"/>
                <path d="M16 50 L34 35 L52 25 L70 40" stroke="var(--mudo)" stroke-width="1" opacity="0.3" stroke-dasharray="4"/>
              </svg>
            </div>
            <h3 class="empty-title">Nenhum dado para exibir</h3>
            <p class="empty-text">Selecione ao menos uma categoria e clique em <strong>Gerar Gráfico</strong> para visualizar as vendas.</p>
          </div>
        }
        <div class="chart-frame" [class.hidden]="semDados() && !carregando()">
          <div class="chart-header">
            <div class="chart-title-group">
              <span class="chart-indicator"></span>
              <span class="chart-title-text">Volume de Vendas</span>
            </div>
          
          </div>
          <div class="chart-body">
            <canvas #chartCanvas></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .analytics-page {
        animation: fadeSlideUp 0.4s ease-out;
        max-width: 1120px;
        margin: 0 auto;
      }

      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* ── HEADER ── */
      .analytics-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 28px;
      }
      .analytics-header-left {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .analytics-badge {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.7rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--acento);
        opacity: 0.7;
      }
      .analytics-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 900;
        font-size: 2.2rem;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        color: var(--branco);
        line-height: 1;
      }
      .analytics-subtitle {
        font-size: 0.82rem;
        color: var(--mudo);
        margin-top: 4px;
      }
      .analytics-header-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: var(--mudo);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding-bottom: 6px;
      }
      .meta-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--verde);
        animation: pulse 2s ease-in-out infinite;
      }

      /* ── CONTROLS PANEL ── */
      .controls-panel {
        background: var(--escuro);
        border: 1px solid var(--borda);
        border-radius: 6px;
        padding: 20px 24px;
        margin-bottom: 20px;
        position: relative;
      }
      .controls-panel::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--acento), transparent);
        opacity: 0.3;
      }
      .controls-row {
        display: flex;
        align-items: flex-end;
        gap: 28px;
        flex-wrap: wrap;
      }
      .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .control-group-cats {
        flex: 1;
        min-width: 240px;
      }
      .control-label {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.72rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--mudo);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .control-icon {
        font-size: 0.85rem;
      }

      /* date range */
      .date-range {
        display: flex;
        align-items: center;
        gap: 0;
        background: var(--preto);
        border: 1px solid var(--borda);
        border-radius: 4px;
        overflow: hidden;
      }
      .date-field {
        position: relative;
        display: flex;
        align-items: center;
      }
      .date-field + .date-field {
        border-left: 1px solid var(--borda);
      }
      .date-field input {
        background: transparent;
        border: none;
        color: var(--branco);
        font-family: 'Barlow', sans-serif;
        font-size: 0.82rem;
        font-weight: 500;
        padding: 9px 12px;
        width: 150px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .date-field input[type='date'] {
        text-transform: none;
        letter-spacing: 0;
        font-size: 0.78rem;
        min-height: 36px;
      }
      .date-field input[type='date']::-webkit-calendar-picker-indicator {
        filter: invert(0.7);
        cursor: pointer;
        padding: 2px;
      }
      .date-field input[type='date']:focus {
        outline: none;
        background: var(--painel);
      }
      .date-field input:focus {
        outline: none;
        background: var(--painel);
      }
      .date-field input::-webkit-calendar-picker-indicator {
        filter: invert(0.6);
        cursor: pointer;
      }
      .date-arrow {
        position: absolute;
        right: -2px;
        color: var(--mudo);
        font-size: 0.7rem;
        pointer-events: none;
        z-index: 1;
      }

      /* category pills */
      .category-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .cat-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: 4px;
        border: 1px solid var(--borda);
        background: var(--preto);
        color: var(--mudo);
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 600;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .cat-pill:hover {
        border-color: var(--claro);
        color: var(--claro);
      }
      .cat-pill.active {
        border-color: var(--pill-color, var(--acento));
        color: var(--pill-color, var(--acento));
        background: color-mix(in srgb, var(--pill-color, var(--acento)) 8%, var(--preto));
        box-shadow: 0 0 12px color-mix(in srgb, var(--pill-color, var(--acento)) 15%, transparent);
      }
      .pill-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
      }
      .cat-pill.active .pill-dot {
        box-shadow: 0 0 6px currentColor;
      }

      /* generate button */
      .generate-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 22px;
        border-radius: 4px;
        border: 1px solid var(--acento);
        background: var(--acento);
        color: var(--preto);
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .generate-btn:hover:not(:disabled) {
        background: transparent;
        color: var(--acento);
        box-shadow: 0 0 20px color-mix(in srgb, var(--acento) 20%, transparent), inset 0 0 20px color-mix(in srgb, var(--acento) 5%, transparent);
      }
      .generate-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-icon {
        flex-shrink: 0;
      }
      .btn-spinner {
        width: 14px; height: 14px;
        border: 2px solid var(--preto);
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }
      .generate-btn:hover:not(:disabled) .btn-spinner {
        border-color: var(--acento);
        border-top-color: transparent;
      }

      /* error */
      .error-bar {
        background: rgba(244, 63, 94, 0.1);
        border: 1px solid rgba(244, 63, 94, 0.3);
        border-radius: 4px;
        padding: 12px 16px;
        color: #fb7185;
        font-size: 0.82rem;
        margin-bottom: 20px;
        animation: fadeSlideUp 0.3s ease-out;
      }

      /* ── CHART CONTAINER ── */
      .chart-container {
        background: var(--escuro);
        border: 1px solid var(--borda);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
      }
      .chart-container::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--acento), transparent);
        opacity: 0.15;
      }

      .chart-frame {
        animation: fadeSlideUp 0.4s ease-out;
      }
      .chart-frame.hidden {
        display: none;
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid var(--borda);
      }
      .chart-title-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .chart-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--verde);
        box-shadow: 0 0 8px var(--verde);
        animation: pulse 2s ease-in-out infinite;
      }
      .chart-title-text {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 800;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--branco);
      }
      .chart-legend {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
      }

      .chart-body {
        padding: 8px 16px 12px 8px;
        position: relative;
      }
      .chart-body canvas {
        width: 100% !important;
        max-height: 440px;
      }

      /* ── EMPTY STATE ── */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 72px 24px;
        text-align: center;
      }
      .empty-graphic {
        margin-bottom: 20px;
        opacity: 0.6;
      }
      .empty-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 800;
        font-size: 1.1rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--claro);
        margin-bottom: 8px;
      }
      .empty-text {
        font-size: 0.85rem;
        color: var(--mudo);
        max-width: 320px;
        line-height: 1.5;
      }
      .empty-text strong {
        color: var(--acento);
        font-weight: 600;
      }

      /* ── RESPONSIVE ── */
      @media (max-width: 768px) {
        .controls-row {
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
        }
        .control-group-cats {
          min-width: unset;
        }
        .date-range {
          width: 100%;
        }
        .date-field {
          flex: 1;
        }
        .date-field input {
          width: 100%;
        }
        .analytics-title {
          font-size: 1.6rem;
        }
        .analytics-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }

      @media (max-width: 480px) {
        .category-pills {
          flex-direction: column;
        }
        .cat-pill {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent {
  private readonly vendaService = inject(VendaService);
  private readonly http = inject(HttpClient);

  protected chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected categorias = signal<Categoria[]>([]);
  protected categoriasSelecionadas = signal<Set<number>>(new Set());
  protected dataInicio = '2025-05-01';
  protected dataFim = '2026-06-30';
  protected carregando = signal(false);
  protected erro = signal<string | null>(null);
  protected semDados = signal(true);

  protected readonly CORES_CATEGORIAS = CORES_CATEGORIAS;

  private chartInstance: Chart | null = null;

  constructor() {
    this.http.get<Categoria[]>('/api/v1/categorias').subscribe((cats) => {
      this.categorias.set(cats);
      this.categoriasSelecionadas.set(new Set(cats.map((c) => c.id)));
      if (cats.length > 0) {
        afterNextRender(() => this.carregarGrafico());
      }
    });
  }

  protected toggleCategoria(id: number) {
    const set = new Set(this.categoriasSelecionadas());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.categoriasSelecionadas.set(set);
  }

  protected carregarGrafico() {
    const ids = Array.from(this.categoriasSelecionadas());
    if (ids.length === 0) {
      this.erro.set('Selecione pelo menos uma categoria.');
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);
    this.semDados.set(false);

    this.vendaService.obterAnaliseVendas(ids, this.dataInicio, this.dataFim).subscribe({
      next: (dados) => {
        this.renderizarGrafico(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar dados. Verifique a conexão e tente novamente.');
        this.carregando.set(false);
      },
    });
  }

  private renderizarGrafico(dados: import('../../../core/models/analytics.model').VendasPorCategoria[]) {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    if (dados.length === 0 || dados.every((d) => d.dados.length === 0)) {
      this.semDados.set(true);
      return;
    }

    const todosMeses = new Set<string>();
    for (const cat of dados) {
      for (const d of cat.dados) {
        todosMeses.add(d.anoMes);
      }
    }
    const meses = Array.from(todosMeses).sort();

    const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const datasets = dados.map((cat, i) => {
      const mapa = new Map(cat.dados.map((d) => [d.anoMes, d.quantidade]));
      const cor = CORES_CATEGORIAS[i % CORES_CATEGORIAS.length];
      return {
        label: cat.categoriaNome,
        data: meses.map((m) => mapa.get(m) ?? 0),
        borderColor: cor,
        backgroundColor: (ctx: { chart: Chart }) => {
          if (!ctx.chart.chartArea) return cor + '20';
          const gradient = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom);
          gradient.addColorStop(0, cor + '30');
          gradient.addColorStop(1, cor + '02');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: cor,
        pointBorderColor: cor,
        pointHoverBackgroundColor: '#0f0f0f',
        pointHoverBorderColor: cor,
        pointHoverBorderWidth: 2,
        borderWidth: 2,
      };
    });

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: meses.map((m) => {
          const [ano, mes] = m.split('-');
          return `${mesesNome[parseInt(mes) - 1]}/${ano}`;
        }),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
          duration: 800,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#ccc',
              font: { family: 'Barlow Condensed', size: 12, weight: 600 },
              padding: 14,
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
            },
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#f0f0f0',
            titleFont: { family: 'Barlow Condensed', size: 13, weight: 700 },
            bodyColor: '#ccc',
            bodyFont: { family: 'Barlow', size: 12 },
            borderColor: '#333',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 4,
            displayColors: true,
            boxPadding: 4,
            usePointStyle: true,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} itens`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#666',
              font: { family: 'Barlow Condensed', size: 11, weight: 600 },
              maxRotation: 45,
            },
            grid: {
              color: 'rgba(51, 51, 51, 0.5)',
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#666',
              font: { family: 'Barlow', size: 10, weight: 500 },
              stepSize: 1,
              padding: 8,
            },
            grid: {
              color: 'rgba(51, 51, 51, 0.4)',
            },
            border: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
          axis: 'x',
        },
        hover: {
          mode: 'nearest',
          intersect: false,
        },
      },
      plugins: [],
    });
  }
}
