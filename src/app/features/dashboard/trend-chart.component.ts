import { Component, inject, AfterViewInit, OnDestroy, signal, viewChild, ElementRef, effect } from '@angular/core';
import { ExpenseService } from '../../core/services/expense.service';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trend-card">
      <div class="trend-header">
        <div class="trend-title-section">
          <h3 class="trend-title">Evolução do Patrimônio</h3>
          <p class="trend-subtitle">Saldo acumulado ao longo do tempo</p>
        </div>
        <div class="trend-indicator" [class.positive]="getCurrentBalance() >= 0" [class.negative]="getCurrentBalance() < 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (getCurrentBalance() >= 0) {
              <polyline points="18 15 12 9 6 15"/>
            } @else {
              <polyline points="6 9 12 15 18 9"/>
            }
          </svg>
          <span>{{ getCurrentBalance() >= 0 ? 'Positivo' : 'Negativo' }}</span>
        </div>
      </div>

      @if (hasData()) {
        <div class="trend-wrapper">
          <canvas #trendCanvas></canvas>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <p class="empty-message">Sem dados de tendência</p>
          <p class="empty-hint">Adicione receitas e despesas para visualizar</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .trend-card {
      padding: var(--spacing-5);
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 320px;
    }

    .trend-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-4);
      flex-wrap: wrap;
      gap: var(--spacing-3);
    }

    .trend-title-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .trend-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .trend-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
    }

    .trend-indicator.positive {
      background: var(--success-50);
      color: var(--success-600);
    }

    .trend-indicator.negative {
      background: var(--danger-50);
      color: var(--danger-600);
    }

    .trend-wrapper {
      flex: 1;
      position: relative;
      min-height: 200px;
    }

    .trend-wrapper canvas {
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
export class TrendChartComponent implements AfterViewInit, OnDestroy {
  private expenseService = inject(ExpenseService);
  
  trendData$ = this.expenseService.trendData$;
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('trendCanvas');
  private chartInstance = signal<Chart | null>(null);

  constructor() {
    effect(() => {
      const data = this.trendData$();
      const chart = this.chartInstance();
      const canvas = this.canvasRef();
      
      setTimeout(() => {
        if (data.length > 0 && canvas) {
          if (chart) {
            this.updateChart();
          } else {
            this.createChart();
          }
        } else if (chart && data.length === 0) {
          chart.data = { labels: [], datasets: [] };
          chart.update();
        }
      }, 0);
    });
  }

  ngAfterViewInit(): void {
    if (this.hasData()) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    const chart = this.chartInstance();
    if (chart) {
      chart.destroy();
    }
  }

  hasData(): boolean {
    return this.trendData$().length > 0;
  }

  getCurrentBalance(): number {
    const data = this.trendData$();
    if (data.length === 0) return 0;
    return data[data.length - 1].balance;
  }

  private createChart(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.getChartJSData();
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: gradient
        }))
      },
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
                return `Saldo: ${new Intl.NumberFormat('pt-BR', {
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
              callback: (value) => {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact',
                  maximumFractionDigits: 0
                }).format(value as number);
              }
            }
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
            backgroundColor: '#3b82f6',
            borderColor: '#ffffff',
            borderWidth: 2
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.chartInstance.set(chart);
  }

  private updateChart(): void {
    const chart = this.chartInstance();
    if (!chart) {
      this.createChart();
      return;
    }

    const data = this.getChartJSData();
    chart.data = data;
    chart.update('active');
  }

  private getChartJSData() {
    const trendData = this.trendData$();
    
    if (trendData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = trendData.map(item => item.month);
    const balanceData = trendData.map(item => item.balance);

    return {
      labels: labels,
      datasets: [{
        label: 'Saldo Acumulado',
        data: balanceData,
        borderColor: '#3b82f6',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }
}
