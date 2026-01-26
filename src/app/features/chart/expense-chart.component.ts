import { Component, inject, AfterViewInit, OnDestroy, signal, viewChild, ElementRef, effect } from '@angular/core';
import { ExpenseService } from '../../core/services/expense.service';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title-section">
          <h3 class="chart-title">Gastos por Categoria</h3>
          <p class="chart-subtitle">Distribuição das suas despesas</p>
        </div>
      </div>

      @if (dadosGrafico$().length > 0) {
        <div class="chart-body">
          <div class="chart-wrapper">
            <canvas #chartCanvas></canvas>
          </div>
          <div class="chart-legend">
            @for (item of dadosGrafico$(); track item.categoria) {
              <div class="legend-item">
                <div class="legend-color" [style.background]="obterCorCategoria(item.categoria)"></div>
                <span class="legend-label">{{ item.categoria }}</span>
                <span class="legend-value">{{ item.total | brlCurrency }}</span>
              </div>
            }
          </div>
        </div>
        <div class="chart-footer">
          <span class="total-label">Total:</span>
          <span class="total-value">{{ totalDespesas$() | brlCurrency }}</span>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
              <path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
          </div>
          <p class="empty-message">Nenhuma despesa registrada</p>
          <p class="empty-hint">Adicione despesas para visualizar o gráfico</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-card {
      padding: var(--spacing-3);
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 240px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-2);
    }

    .chart-title-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .chart-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .chart-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .chart-body {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-2);
      align-items: center;
    }

    .chart-wrapper {
      position: relative;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-wrapper canvas {
      max-width: 100%;
      max-height: 100%;
    }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2);
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
    }

    .legend-item:hover {
      background: var(--gray-50);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--gray-700);
    }

    .legend-value {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-900);
    }

    .chart-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--spacing-2);
      border-top: 1px solid var(--gray-100);
      margin-top: var(--spacing-2);
    }

    .total-label {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--gray-600);
    }

    .total-value {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--primary-600);
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

    @media (max-width: 600px) {
      .chart-body {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExpenseChartComponent implements AfterViewInit, OnDestroy {
  private expenseService = inject(ExpenseService);
  
  dadosGrafico$ = this.expenseService.dadosGrafico$;
  totalDespesas$ = this.expenseService.totalDespesas$;
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private instanciaGrafico = signal<Chart | null>(null);
  private tamanhoDadosAnterior = 0;

  private readonly coresCategoria: { [key: string]: string } = {
    'Alimentação': '#3b82f6',
    'Transporte': '#10b981',
    'Lazer': '#8b5cf6',
    'Saúde': '#ef4444',
    'Educação': '#f59e0b',
    'Moradia': '#06b6d4',
    'Outros': '#6b7280'
  };

  constructor() {
    effect(() => {
      const dados = this.dadosGrafico$();
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
    if (this.dadosGrafico$().length > 0) {
      this.criarGrafico();
    }
  }

  ngOnDestroy(): void {
    const grafico = this.instanciaGrafico();
    if (grafico) {
      grafico.destroy();
    }
  }

  obterCorCategoria(categoria: string): string {
    return this.coresCategoria[categoria] || this.coresCategoria['Outros'];
  }

  private criarGrafico(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dados = this.obterDadosChartJS();
    
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: dados,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
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
                const valor = context.raw as number;
                const total = this.totalDespesas$();
                const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : '0';
                return `${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(valor)} (${percentual}%)`;
              }
            }
          }
        }
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
    
    if (!dados.labels || dados.labels.length === 0) {
      grafico.data = { labels: [], datasets: [] };
      grafico.update();
      return;
    }

    grafico.data = dados;
    grafico.update('active');
  }

  private obterDadosChartJS() {
    const dadosGrafico = this.dadosGrafico$();
    
    if (dadosGrafico.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const rotulos = dadosGrafico.map(item => item.categoria);
    const valores = dadosGrafico.map(item => item.total);
    const cores = dadosGrafico.map(item => this.obterCorCategoria(item.categoria));

    return {
      labels: rotulos,
      datasets: [{
        data: valores,
        backgroundColor: cores,
        borderWidth: 0,
        hoverOffset: 8
      }]
    };
  }
}
