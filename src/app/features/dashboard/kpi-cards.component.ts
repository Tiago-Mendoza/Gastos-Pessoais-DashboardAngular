import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="kpi-grid">
      <!-- Total Geral -->
      <div class="kpi-card">
        <div class="kpi-icon total">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v12M8 10h8M8 14h8"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">Total Geral</span>
          <span class="kpi-value">{{ totalExpenses$() | brlCurrency }}</span>
        </div>
        <div class="kpi-trend neutral">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          </svg>
        </div>
      </div>

      <!-- Débito -->
      <div class="kpi-card">
        <div class="kpi-icon debit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">Débito/Pix</span>
          <span class="kpi-value">{{ totalDebito$() | brlCurrency }}</span>
        </div>
        <div class="kpi-badge debit">À Vista</div>
      </div>

      <!-- Crédito -->
      <div class="kpi-card">
        <div class="kpi-icon credit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
            <path d="M7 15h0m4 0h0m4 0h0"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">Crédito</span>
          <span class="kpi-value">{{ totalCredito$() | brlCurrency }}</span>
        </div>
        <div class="kpi-badge credit">Parcelado</div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-3);
      height: 100%;
    }

    .kpi-card {
      background: white;
      border-radius: var(--radius-md);
      padding: var(--spacing-2);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      transition: all var(--transition-base);
      position: relative;
      overflow: hidden;
      flex: 1;
      min-height: 70px;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }

    .kpi-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      border-color: var(--gray-300);
    }

    .kpi-card:nth-child(1)::before {
      background: linear-gradient(180deg, var(--primary-500), var(--primary-600));
    }

    .kpi-card:nth-child(2)::before {
      background: linear-gradient(180deg, var(--success-500), var(--success-600));
    }

    .kpi-card:nth-child(3)::before {
      background: linear-gradient(180deg, var(--warning-500), var(--warning-600));
    }

    .kpi-icon {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon.total {
      background: var(--primary-50);
      color: var(--primary-600);
    }

    .kpi-icon.debit {
      background: var(--success-50);
      color: var(--success-600);
    }

    .kpi-icon.credit {
      background: var(--warning-50);
      color: var(--warning-600);
    }

    .kpi-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .kpi-label {
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--gray-500);
      line-height: 1.2;
    }

    .kpi-value {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--gray-900);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .kpi-trend {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-trend.neutral {
      background: var(--gray-100);
      color: var(--gray-500);
    }

    .kpi-badge {
      padding: 2px 6px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .kpi-badge.debit {
      background: var(--success-100);
      color: var(--success-700);
    }

    .kpi-badge.credit {
      background: var(--warning-100);
      color: var(--warning-600);
    }

    @media (max-width: 900px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class KpiCardsComponent {
  private expenseService = inject(ExpenseService);

  totalExpenses$ = this.expenseService.totalExpenses$;
  totalDebito$ = this.expenseService.totalDebito$;
  totalCredito$ = this.expenseService.totalCredito$;
}
