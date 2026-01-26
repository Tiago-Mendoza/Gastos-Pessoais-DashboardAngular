import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-upcoming-due-dates',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="due-dates-card">
      <div class="due-dates-header">
        <div class="due-dates-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="due-dates-title-section">
          <h3 class="due-dates-title">Próximos Vencimentos</h3>
          <p class="due-dates-subtitle">Despesas fixas - 7 dias</p>
        </div>
      </div>

      @if (proximosVencimentos$().length > 0) {
        <div class="due-dates-list">
          @for (despesa of proximosVencimentos$(); track despesa.id) {
            <div class="due-date-item">
              <div class="due-date-left">
                <div class="due-date-day">
                  {{ despesa.dataVencimento! | date: 'dd' }}
                  <span class="due-date-month">{{ despesa.dataVencimento! | date: 'MMM' }}</span>
                </div>
              </div>
              <div class="due-date-content">
                <span class="due-date-description">{{ despesa.descricao }}</span>
                <span class="due-date-category">{{ despesa.categoria }}</span>
              </div>
              <div class="due-date-value">
                {{ despesa.valor | brlCurrency }}
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p class="empty-message">Tudo em dia!</p>
          <p class="empty-hint">Nenhum vencimento nos próximos 7 dias</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .due-dates-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-3);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .due-dates-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-3);
      padding-bottom: var(--spacing-2);
      border-bottom: 1px solid var(--gray-100);
    }

    .due-dates-icon {
      width: 32px;
      height: 32px;
      background: var(--warning-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--warning-600);
    }

    .due-dates-title-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .due-dates-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .due-dates-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .due-dates-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      flex: 1;
      overflow-y: auto;
    }

    .due-date-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2);
      background: var(--gray-50);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-100);
      transition: all var(--transition-fast);
    }

    .due-date-item:hover {
      background: white;
      border-color: var(--warning-200);
      box-shadow: var(--shadow-sm);
    }

    .due-date-left {
      flex-shrink: 0;
    }

    .due-date-day {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--warning-500), var(--warning-600));
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: var(--font-size-base);
      font-weight: 700;
      line-height: 1;
    }

    .due-date-month {
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .due-date-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      min-width: 0;
    }

    .due-date-description {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-800);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .due-date-category {
      font-size: var(--font-size-xs);
      color: var(--gray-500);
    }

    .due-date-value {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--gray-900);
      white-space: nowrap;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-6);
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      background: var(--success-50);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--success-500);
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
export class UpcomingDueDatesComponent {
  private expenseService = inject(ExpenseService);
  
  proximosVencimentos$ = this.expenseService.proximosVencimentos$;
}
