import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="balance-card" [class.positive]="balance$() >= 0" [class.negative]="balance$() < 0">
      <div class="balance-header">
        <div class="balance-icon" [class.positive]="balance$() >= 0" [class.negative]="balance$() < 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (balance$() >= 0) {
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            } @else {
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            }
          </svg>
        </div>
        <span class="balance-title">Saldo Atual</span>
      </div>
      
      <div class="balance-amount" [class.positive]="balance$() >= 0" [class.negative]="balance$() < 0">
        {{ balance$() | brlCurrency }}
      </div>
      
      <div class="balance-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-dot income"></div>
          <span class="breakdown-label">Receitas</span>
          <span class="breakdown-value income">{{ totalIncomes$() | brlCurrency }}</span>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-dot expense"></div>
          <span class="breakdown-label">Despesas</span>
          <span class="breakdown-value expense">{{ totalExpenses$() | brlCurrency }}</span>
        </div>
      </div>
      
      <div class="balance-indicator">
        <div class="indicator-bar">
          <div 
            class="indicator-fill" 
            [class.positive]="balance$() >= 0"
            [class.negative]="balance$() < 0"
            [style.width.%]="getIndicatorWidth()"
          ></div>
        </div>
        <span class="indicator-label">
          {{ balance$() >= 0 ? 'Saldo positivo' : 'Saldo negativo' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .balance-card {
      background: white;
      border-radius: var(--radius-md);
      padding: var(--spacing-2);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      transition: all var(--transition-base);
      height: 100%;
      min-height: 70px;
    }

    .balance-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--gray-300);
    }

    .balance-card.positive {
      border-left: 4px solid var(--success-500);
    }

    .balance-card.negative {
      border-left: 4px solid var(--danger-500);
    }

    .balance-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .balance-icon {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .balance-icon.positive {
      background: var(--success-50);
      color: var(--success-600);
    }

    .balance-icon.negative {
      background: var(--danger-50);
      color: var(--danger-600);
    }

    .balance-title {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--gray-600);
      line-height: 1.2;
    }

    .balance-amount {
      font-size: var(--font-size-base);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .balance-amount.positive {
      color: var(--success-600);
    }

    .balance-amount.negative {
      color: var(--danger-600);
    }

    .balance-breakdown {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: var(--spacing-1);
      background: var(--gray-50);
      border-radius: var(--radius-sm);
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .breakdown-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }

    .breakdown-dot.income {
      background: var(--success-500);
    }

    .breakdown-dot.expense {
      background: var(--danger-500);
    }

    .breakdown-label {
      flex: 1;
      font-size: var(--font-size-xs);
      color: var(--gray-600);
      line-height: 1.2;
    }

    .breakdown-value {
      font-size: var(--font-size-xs);
      font-weight: 600;
      line-height: 1.2;
    }

    .breakdown-value.income {
      color: var(--success-600);
    }

    .breakdown-value.expense {
      color: var(--danger-600);
    }

    .balance-indicator {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .indicator-bar {
      height: 4px;
      background: var(--gray-200);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .indicator-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width var(--transition-slow);
    }

    .indicator-fill.positive {
      background: linear-gradient(90deg, var(--success-400), var(--success-500));
    }

    .indicator-fill.negative {
      background: linear-gradient(90deg, var(--danger-400), var(--danger-500));
    }

    .indicator-label {
      font-size: 10px;
      color: var(--gray-500);
      font-weight: 500;
      line-height: 1.2;
    }
  `]
})
export class BalanceCardComponent {
  private expenseService = inject(ExpenseService);
  
  balance$ = this.expenseService.balance$;
  totalIncomes$ = this.expenseService.totalIncomes$;
  totalExpenses$ = this.expenseService.totalExpenses$;

  getIndicatorWidth(): number {
    const income = this.totalIncomes$();
    const expense = this.totalExpenses$();
    const total = income + expense;
    if (total === 0) return 50;
    return Math.min(100, Math.max(0, (income / total) * 100));
  }
}
