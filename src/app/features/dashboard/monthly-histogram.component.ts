import { Component, inject, AfterViewInit, OnDestroy, signal, viewChild, ElementRef, effect } from '@angular/core';
import { ExpenseService } from '../../core/services/expense.service';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-monthly-histogram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="histogram-card">
      <div class="histogram-header">
        <div class="histogram-title-section">
          <h3 class="histogram-title">Histograma Mensal</h3>
          <p class="histogram-subtitle">Comparativo por tipo de pagamento</p>
        </div>
        <div class="histogram-legend">
          <div class="legend-item">
            <div class="legend-dot" style="background: #3b82f6;"></div>
            <span>Geral</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: #10b981;"></div>
            <span>Débito</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: #f59e0b;"></div>
            <span>Crédito</span>
          </div>
        </div>
      </div>

      @if (temDados()) {
        <div class="histogram-wrapper">
          <canvas #histogramCanvas></canvas>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <p class="empty-message">Nenhum dado disponível</p>
          <p class="empty-hint">Adicione despesas para visualizar o histograma</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .histogram-card {
      padding: var(--spacing-3);
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 240px;
    }

    .histogram-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-2);
      flex-wrap: wrap;
      gap: var(--spacing-2);
    }

    .histogram-title-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .histogram-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .histogram-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .histogram-legend {
      display: flex;
      gap: var(--spacing-4);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-xs);
      color: var(--gray-600);
      font-weight: 500;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
    }

    .histogram-wrapper {
      flex: 1;
      position: relative;
      min-height: 140px;
    }

    .histogram-wrapper canvas {
      width: 100% !important;
      height: 100% !important;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-8);
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: var(--gray-100);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-400);
      margin-bottom: var(--spacing-4);
    }

    .empty-message {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--gray-700);
      margin: 0 0 var(--spacing-1) 0;
    }

    .empty-hint {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }
  `]
})
export class MonthlyHistogramComponent implements AfterViewInit, OnDestroy {
  private expenseService = inject(ExpenseService);
  
  dadosMensais$ = this.expenseService.dadosHistogramaMensal$;
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('histogramCanvas');
  private instanciaGrafico = signal<Chart | null>(null);
  private tamanhoDadosAnterior = 0;

  constructor() {
    effect(() => {
      const dados = this.dadosMensais$();
      const grafico = this.instanciaGrafico();
      const canvas = this.canvasRef();
      
      setTimeout(() => {
        if (dados.length > 0 && canvas) {
          if (this.tamanhoDadosAnterior === 0 && grafico) {
            grafico.destroy();
            this.instanciaGrafico.set(null);
            this.criarGrafico();
          } else if (grafico) {
            this.atualizarGrafico();
          } else {
            this.criarGrafico();
          }
        } else if (grafico && dados.length === 0) {
          grafico.data = { labels: [], datasets: [] };
          grafico.update();
        }
        this.tamanhoDadosAnterior = dados.length;
      }, 0);
    });
  }

  ngAfterViewInit(): void {
    if (this.temDados()) {
      this.criarGrafico();
    }
  }

  ngOnDestroy(): void {
    const grafico = this.instanciaGrafico();
    if (grafico) {
      grafico.destroy();
    }
  }

  temDados(): boolean {
    return this.dadosMensais$().length > 0;
  }

  private criarGrafico(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dados = this.obterDadosChartJS();
    
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: dados,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 12,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(context.parsed.y as number)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              color: '#64748b'
            }
          },
          y: {
            grid: { color: '#f1f5f9' },
            border: { display: false },
            ticks: {
              font: { size: 11 },
              color: '#64748b',
              callback: (valor) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact',
                  maximumFractionDigits: 0
                }).format(valor as number);
              }
            }
          }
        },
        datasets: {
          bar: {
            categoryPercentage: 0.7,
            barPercentage: 0.85
          }
        } as any
      }
    };

    const grafico = new Chart(ctx, config);
    this.instanciaGrafico.set(grafico);
  }

  private atualizarGrafico(): void {
    const grafico = this.instanciaGrafico();
    if (!grafico) {
      this.criarGrafico();
      return;
    }

    const dados = this.obterDadosChartJS();
    grafico.data = dados;
    grafico.update('active');
  }

  private obterDadosChartJS() {
    const dadosMensais = this.dadosMensais$();
    
    if (dadosMensais.length === 0) {
      return { labels: [], datasets: [] };
    }

    const rotulos = dadosMensais.map(item => item.mes);

    return {
      labels: rotulos,
      datasets: [
        {
          label: 'Geral',
          data: dadosMensais.map(item => item.geral),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          maxBarThickness: 24
        },
        {
          label: 'Débito',
          data: dadosMensais.map(item => item.debito),
          backgroundColor: '#10b981',
          borderRadius: 6,
          maxBarThickness: 24
        },
        {
          label: 'Crédito',
          data: dadosMensais.map(item => item.credito),
          backgroundColor: '#f59e0b',
          borderRadius: 6,
          maxBarThickness: 24
        }
      ]
    };
  }
}
