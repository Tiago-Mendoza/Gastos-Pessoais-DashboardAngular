import { Component, inject } from '@angular/core';
import { ExpenseComponent } from './features/expenses/expense.component';
import { ExpenseChartComponent } from './features/chart/expense-chart.component';
import { KpiCardsComponent } from './features/dashboard/kpi-cards.component';
import { MonthlyHistogramComponent } from './features/dashboard/monthly-histogram.component';
import { BalanceCardComponent } from './features/dashboard/balance-card.component';
import { BudgetControlComponent } from './features/dashboard/budget-control.component';
import { TrendChartComponent } from './features/dashboard/trend-chart.component';
import { UpcomingDueDatesComponent } from './features/dashboard/upcoming-due-dates.component';
import { IncomeFormComponent } from './features/income/income-form.component';
import { ExpenseService } from './core/services/expense.service';
import { CurrencyPipe } from './shared/pipes/currency.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ExpenseComponent,
    ExpenseChartComponent,
    KpiCardsComponent,
    MonthlyHistogramComponent,
    BalanceCardComponent,
    BudgetControlComponent,
    TrendChartComponent,
    UpcomingDueDatesComponent,
    IncomeFormComponent,
    CurrencyPipe
  ],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
              </svg>
            </div>
            <div class="logo-text">
              <span class="logo-title">FinControl</span>
              <span class="logo-subtitle">Gestão Financeira</span>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-section-title">Menu Principal</span>
            <a class="nav-item active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Dashboard
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">JD</div>
            <div class="user-details">
              <span class="user-name">Usuário</span>
              <span class="user-role">Conta Pessoal</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Header -->
        <header class="top-header">
          <div class="header-left">
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Acompanhe suas finanças em tempo real</p>
          </div>
          
          <div class="header-center">
            <div class="filter-controls">
              <div class="filter-group">
                <label class="filter-label">Período</label>
                <div class="filter-row">
                  <div class="btn-group">
                    <button
                      type="button"
                      class="filter-btn"
                      [class.active]="selectedYear$() === null"
                      (click)="setYearFilter(null)"
                    >
                      Todos
                    </button>
                    @for (year of availableYears$(); track year) {
                      <button
                        type="button"
                        class="filter-btn"
                        [class.active]="selectedYear$() === year"
                        (click)="setYearFilter(year)"
                      >
                        {{ year }}
                      </button>
                    }
                  </div>
                  <select
                    class="filter-select"
                    [value]="selectedMonth$() === null ? 'all' : selectedMonth$()!.toString()"
                    (change)="onMonthChange($any($event.target).value)"
                  >
                    <option value="all">Todos os meses</option>
                    @for (month of months; track month.value) {
                      <option [value]="month.value">{{ month.label }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="header-right">
            <div class="quick-stats">
              <div class="quick-stat">
                <span class="quick-stat-label">Total de Gastos</span>
                <span class="quick-stat-value">{{ totalExpenses$() | brlCurrency }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Dashboard Content -->
        <div class="dashboard-content">
          <!-- Metrics Row -->
          <section class="metrics-section">
            <app-kpi-cards></app-kpi-cards>
            <div class="balance-wrapper">
              <app-balance-card></app-balance-card>
            </div>
          </section>

          <!-- Charts Row -->
          <section class="charts-section">
            <div class="chart-card-wrapper">
              <app-expense-chart></app-expense-chart>
            </div>
            <div class="chart-card-wrapper">
              <app-monthly-histogram></app-monthly-histogram>
            </div>
            <div class="chart-card-wrapper">
              <app-trend-chart></app-trend-chart>
            </div>
          </section>

          <!-- Management Row -->
          <section class="management-section">
            <div class="management-card-wrapper budget-wrapper">
              <app-budget-control></app-budget-control>
            </div>
            <div class="management-card-wrapper forms-wrapper">
              <app-income-form></app-income-form>
              <app-expense></app-expense>
            </div>
            <div class="management-card-wrapper due-dates-wrapper">
              <app-upcoming-due-dates></app-upcoming-due-dates>
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* App Layout */
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--gray-50);
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, var(--gray-900) 0%, var(--gray-800) 100%);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }

    .sidebar-header {
      padding: var(--spacing-6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: white;
      letter-spacing: -0.02em;
    }

    .logo-subtitle {
      font-size: var(--font-size-xs);
      color: var(--gray-400);
      font-weight: 500;
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-4);
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: var(--spacing-6);
    }

    .nav-section-title {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0 var(--spacing-3);
      margin-bottom: var(--spacing-2);
      display: block;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-3);
      border-radius: var(--radius-lg);
      color: var(--gray-400);
      font-size: var(--font-size-sm);
      font-weight: 500;
      text-decoration: none;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .nav-item.active {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .nav-item svg {
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: var(--spacing-4);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      border-radius: var(--radius-lg);
      transition: background var(--transition-fast);
    }

    .user-info:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--success-500), var(--success-600));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: var(--font-size-sm);
      font-weight: 600;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: white;
    }

    .user-role {
      font-size: var(--font-size-xs);
      color: var(--gray-400);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Top Header */
    .top-header {
      background: white;
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-4);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .page-title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--gray-900);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .header-center {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .filter-label {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .btn-group {
      display: flex;
      background: var(--gray-100);
      border-radius: var(--radius-lg);
      padding: var(--spacing-1);
      gap: var(--spacing-1);
    }

    .filter-btn {
      padding: var(--spacing-2) var(--spacing-4);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .filter-btn:hover {
      background: var(--gray-200);
      color: var(--gray-800);
    }

    .filter-btn.active {
      background: white;
      color: var(--primary-600);
      box-shadow: var(--shadow-sm);
    }

    .filter-select {
      padding: var(--spacing-2) var(--spacing-4);
      padding-right: var(--spacing-8);
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--gray-700);
      cursor: pointer;
      transition: all var(--transition-fast);
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      min-width: 160px;
    }

    .filter-select:hover {
      border-color: var(--gray-300);
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .quick-stats {
      display: flex;
      gap: var(--spacing-4);
    }

    .quick-stat {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding: var(--spacing-2) var(--spacing-3);
      background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
      border-radius: var(--radius-lg);
      border: 1px solid var(--primary-200);
    }

    .quick-stat-label {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--primary-600);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .quick-stat-value {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--primary-700);
      letter-spacing: -0.02em;
    }

    /* Dashboard Content */
    .dashboard-content {
      flex: 1;
      padding: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      max-width: 100%;
      overflow-x: hidden;
    }

    /* Metrics Section */
    .metrics-section {
      display: grid;
      grid-template-columns: 3fr 1fr;
      gap: var(--spacing-3);
      align-items: stretch;
    }

    .metrics-section app-kpi-cards {
      height: 100%;
    }

    .balance-wrapper {
      height: 100%;
      min-width: 200px;
    }

    .balance-wrapper app-balance-card {
      height: 100%;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-3);
    }

    .chart-card-wrapper {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: all var(--transition-base);
    }

    .chart-card-wrapper:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--gray-300);
    }

    /* Management Section */
    .management-section {
      display: grid;
      grid-template-columns: 300px 1fr 260px;
      gap: var(--spacing-3);
      align-items: start;
    }

    .management-card-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .forms-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-2);
      align-items: start;
    }

    /* Desktop Otimizado - Telas grandes */
    @media (min-width: 1600px) {
      .dashboard-content {
        padding: var(--spacing-5);
      }
      
      .metrics-section {
        grid-template-columns: 3fr 1fr;
        gap: var(--spacing-4);
      }
      
      .management-section {
        grid-template-columns: 320px 1fr 280px;
      }
    }

    /* Desktop Médio */
    @media (max-width: 1599px) and (min-width: 1200px) {
      .management-section {
        grid-template-columns: 280px 1fr 240px;
      }
    }

    /* Responsive */
    @media (max-width: 1400px) {
      .charts-section {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .management-section {
        grid-template-columns: 1fr 1fr;
      }
      
      .forms-wrapper {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 1200px) {
      .metrics-section {
        grid-template-columns: 2fr 1fr;
      }
      
      .charts-section {
        grid-template-columns: 1fr;
      }
      
      .management-section {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 900px) {
      .metrics-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .top-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-4);
        padding: var(--spacing-4);
      }
      
      .header-left {
        text-align: center;
      }
      
      .header-center {
        justify-content: center;
      }
      
      .filter-row {
        flex-direction: column;
        width: 100%;
      }
      
      .btn-group {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .filter-select {
        width: 100%;
      }
      
      .header-right {
        justify-content: center;
      }
      
      .dashboard-content {
        padding: var(--spacing-4);
      }
    }
  `]
})
export class AppComponent {
  private expenseService = inject(ExpenseService);
  totalExpenses$ = this.expenseService.totalExpenses$;
  selectedYear$ = this.expenseService.selectedYear$;
  selectedMonth$ = this.expenseService.selectedMonth$;
  availableYears$ = this.expenseService.availableYears$;
  title = 'FinControl';

  readonly months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  setYearFilter(year: number | null): void {
    this.expenseService.setYearFilter(year);
  }

  onMonthChange(value: string): void {
    if (value === 'all') {
      this.expenseService.setMonthFilter(null);
    } else {
      this.expenseService.setMonthFilter(parseInt(value, 10));
    }
  }
}
