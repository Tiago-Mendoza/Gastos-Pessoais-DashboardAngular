import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { CommonModule, DatePipe } from '@angular/common';
import { CATEGORIAS } from './models/expense.model';

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
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar-open]="sidebarAberta()" [class.sidebar-closed]="!sidebarAberta()" [class.sidebar-collapsed]="sidebarColapsada()">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
              </svg>
            </div>
            <div class="logo-text" [class.hidden]="sidebarColapsada()">
              <span class="logo-title">FinControl</span>
              <span class="logo-subtitle">Gestão Financeira</span>
            </div>
          </div>
          <button class="sidebar-toggle-btn" (click)="toggleSidebarColapsada()" aria-label="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              @if (sidebarColapsada()) {
                <polyline points="9 18 15 12 9 6"/>
              } @else {
                <polyline points="15 18 9 12 15 6"/>
              }
            </svg>
          </button>
          <button class="sidebar-close-btn" (click)="toggleSidebar()" aria-label="Fechar menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-section-title" [class.hidden]="sidebarColapsada()">Menu Principal</span>
            <a class="nav-item active" [title]="sidebarColapsada() ? 'Dashboard' : ''">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span [class.hidden]="sidebarColapsada()">Dashboard</span>
            </a>
            
            <button class="nav-item-extrato" (click)="abrirModalReceitas()" [title]="sidebarColapsada() ? 'Extrato de Receitas' : ''">
              <div class="extrato-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div class="extrato-text" [class.hidden]="sidebarColapsada()">
                <span class="extrato-title">Extrato de Receitas</span>
                <span class="extrato-subtitle">Gerencie suas entradas</span>
              </div>
            </button>
            
            <button class="nav-item-extrato" (click)="abrirModalDespesas()" [title]="sidebarColapsada() ? 'Extrato de Despesas' : ''">
              <div class="extrato-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div class="extrato-text" [class.hidden]="sidebarColapsada()">
                <span class="extrato-title">Extrato de Despesas</span>
                <span class="extrato-subtitle">Visualize seus gastos</span>
              </div>
            </button>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">JD</div>
            <div class="user-details" [class.hidden]="sidebarColapsada()">
              <span class="user-name">Usuário</span>
              <span class="user-role">Conta Pessoal</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay para mobile quando sidebar está aberta -->
      @if (sidebarAberta()) {
        <div class="sidebar-overlay" (click)="toggleSidebar()"></div>
      }

      <!-- Main Content -->
      <main class="main-content" [class.sidebar-closed]="!sidebarAberta()" [class.sidebar-collapsed]="sidebarColapsada()">
        <!-- Top Header -->
        <header class="top-header">
          <button class="menu-toggle" (click)="toggleSidebar()" aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
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
                      [class.active]="anoSelecionado$() === null"
                      (click)="definirFiltroAno(null)"
                    >
                      Todos
                    </button>
                    @for (ano of anosDisponiveis$(); track ano) {
                      <button
                        type="button"
                        class="filter-btn"
                        [class.active]="anoSelecionado$() === ano"
                        (click)="definirFiltroAno(ano)"
                      >
                        {{ ano }}
                      </button>
                    }
                  </div>
                  <select
                    class="filter-select"
                    [value]="mesSelecionado$() === null ? 'all' : mesSelecionado$()!.toString()"
                    (change)="aoMudarMes($any($event.target).value)"
                  >
                    <option value="all">Todos os meses</option>
                    @for (mes of meses; track mes.value) {
                      <option [value]="mes.value">{{ mes.label }}</option>
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
                <span class="quick-stat-value">{{ totalDespesas$() | brlCurrency }}</span>
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

    <!-- Modal de Extrato de Receitas -->
    @if (mostrarModalReceitas()) {
      <div class="modal-overlay" (click)="fecharModalReceitas()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">Extrato de Receitas</h2>
                <p class="modal-subtitle">Gerencie suas entradas</p>
              </div>
            </div>
            <button class="btn-close" (click)="fecharModalReceitas()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-summary">
            <div class="summary-item total">
              <span class="summary-label">Total de Receitas</span>
              <span class="summary-value">{{ totalReceitas$() | brlCurrency }}</span>
            </div>
            <div class="summary-item count">
              <span class="summary-label">Quantidade</span>
              <span class="summary-value">{{ receitas$().length }} registro(s)</span>
            </div>
          </div>

          <div class="modal-body">
            @if (receitas$().length > 0) {
              <div class="extrato-list">
                @for (receita of receitas$(); track receita.id) {
                  <div class="extrato-item">
                    <div class="extrato-date">
                      <span class="date-day">{{ receita.data | date:'dd' }}</span>
                      <span class="date-month">{{ receita.data | date:'MMM' }}</span>
                    </div>
                    <div class="extrato-info">
                      <span class="extrato-desc">{{ receita.descricao }}</span>
                      <span class="extrato-category">{{ receita.categoria || 'Outros' }}</span>
                    </div>
                    <div class="extrato-value">
                      <span class="value-amount">+ {{ receita.valor | brlCurrency }}</span>
                    </div>
                    <button class="btn-delete" (click)="removerReceita(receita.id)" title="Remover">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <p class="empty-title">Nenhuma receita cadastrada</p>
                <p class="empty-desc">Adicione receitas usando o formulário "Nova Receita"</p>
              </div>
            }
          </div>

          @if (receitas$().length > 0) {
            <div class="modal-footer">
              <button class="btn-clear-all" (click)="limparTodasReceitas()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Limpar todas as receitas
              </button>
            </div>
          }
        </div>
      </div>
    }

    <!-- Modal de Extrato de Despesas -->
    @if (mostrarModalDespesas()) {
      <div class="modal-overlay" (click)="fecharModalDespesas()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">Extrato de Despesas</h2>
                <p class="modal-subtitle">Gerencie seus gastos</p>
              </div>
            </div>
            <button class="btn-close" (click)="fecharModalDespesas()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-summary">
            <div class="summary-item total">
              <span class="summary-label">Total de Despesas</span>
              <span class="summary-value expense">{{ totalDespesas$() | brlCurrency }}</span>
            </div>
            <div class="summary-item count">
              <span class="summary-label">Quantidade</span>
              <span class="summary-value">{{ todasDespesas$().length }} registro(s)</span>
            </div>
            <div class="summary-filter">
              <span class="summary-label">Filtrar</span>
              <select
                class="modal-filter-select"
                [value]="categoriaSelecionada$()"
                (change)="aoMudarCategoria($any($event.target).value)"
              >
                @for (categoria of categorias; track categoria) {
                  <option [value]="categoria">{{ categoria }}</option>
                }
              </select>
            </div>
          </div>

          <div class="modal-body">
            @if (despesasFiltradas$().length > 0) {
              <div class="extrato-list">
                @for (despesa of despesasFiltradas$(); track despesa.id) {
                  <div class="extrato-item" [class.high-value]="ehAltoValor(despesa.valor)">
                    <div class="extrato-date">
                      <span class="date-day">{{ despesa.data | date:'dd' }}</span>
                      <span class="date-month">{{ despesa.data | date:'MMM' }}</span>
                    </div>
                    <div class="extrato-icon" [class.high-value]="ehAltoValor(despesa.valor)">
                      {{ obterEmojiCategoria(despesa.categoria) }}
                    </div>
                    <div class="extrato-info">
                      <span class="extrato-desc">{{ despesa.descricao }}</span>
                      <div class="extrato-meta">
                        <span class="extrato-category">{{ despesa.categoria }}</span>
                        <span class="extrato-payment" [class.credit]="despesa.tipoPagamento === 'crédito'">
                          {{ despesa.tipoPagamento === 'crédito' ? 'Crédito' : 'À Vista' }}
                        </span>
                        @if (despesa.tipoDespesa === 'fixa') {
                          <span class="extrato-type">Fixa</span>
                        }
                      </div>
                    </div>
                    <div class="extrato-value">
                      <span class="value-amount">- {{ despesa.valor | brlCurrency }}</span>
                    </div>
                    <button class="btn-delete" (click)="removerDespesa(despesa.id)" title="Remover">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <p class="empty-title">Nenhuma despesa encontrada</p>
                <p class="empty-desc">
                  @if (categoriaSelecionada$() !== 'Todas') {
                    Não há despesas na categoria "{{ categoriaSelecionada$() }}"
                  } @else {
                    Adicione despesas usando o formulário
                  }
                </p>
              </div>
            }
          </div>

          @if (todasDespesas$().length > 0) {
            <div class="modal-footer">
              <button class="btn-clear-all" (click)="limparTodasDespesas()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Limpar todas as despesas
              </button>
            </div>
          }
        </div>
      </div>
    }
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
      z-index: 200;
      left: 0;
      top: 0;
      transition: width var(--transition-base), transform var(--transition-base);
      transform: translateX(0);
    }

    .sidebar.sidebar-closed {
      transform: translateX(-100%);
    }

    .sidebar.sidebar-collapsed {
      width: 80px;
    }

    .hidden {
      display: none !important;
    }

    .sidebar-toggle-btn {
      display: flex;
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      color: white;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      margin-left: auto;
      flex-shrink: 0;
    }

    .sidebar-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .sidebar-close-btn {
      display: none;
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      color: white;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      margin-left: auto;
    }

    .sidebar-close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 150;
      backdrop-filter: blur(2px);
    }

    .sidebar-header {
      padding: var(--spacing-6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      min-width: 0;
    }

    .sidebar.sidebar-collapsed .logo {
      justify-content: center;
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
      color: var(--gray-300);
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
      white-space: nowrap;
    }

    .sidebar.sidebar-collapsed .nav-item {
      justify-content: center;
      padding: var(--spacing-3);
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

    /* Botões de Extrato na Sidebar */
    .nav-item-extrato {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all var(--transition-fast);
      width: 100%;
      text-align: left;
      margin-top: var(--spacing-2);
      white-space: nowrap;
    }

    .sidebar.sidebar-collapsed .nav-item-extrato {
      justify-content: center;
      padding: var(--spacing-3);
    }

    .nav-item-extrato:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateX(2px);
    }

    .extrato-icon-wrapper {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .sidebar.sidebar-collapsed .extrato-icon-wrapper {
      width: 40px;
      height: 40px;
    }

    .extrato-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .extrato-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: white;
      line-height: 1.2;
    }

    .extrato-subtitle {
      font-size: var(--font-size-xs);
      color: var(--gray-300);
      line-height: 1.2;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-4);
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--gray-100);
    }

    .modal-title-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .modal-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--success-50), var(--success-100));
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--success-600);
    }

    .modal-title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--gray-900);
      margin: 0;
    }

    .modal-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .btn-close {
      width: 36px;
      height: 36px;
      border: none;
      background: var(--gray-100);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--gray-500);
      transition: all var(--transition-fast);
    }

    .btn-close:hover {
      background: var(--gray-200);
      color: var(--gray-700);
    }

    .modal-summary {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--spacing-3);
      padding: var(--spacing-4);
      background: var(--gray-50);
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .summary-label {
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary-value {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--gray-900);
    }

    .summary-item.total .summary-value {
      color: var(--success-600);
    }

    .summary-item.total .summary-value.expense {
      color: var(--danger-600);
    }

    .summary-filter {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      align-items: flex-end;
    }

    .modal-filter-select {
      padding: var(--spacing-2) var(--spacing-3);
      padding-right: var(--spacing-8);
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--gray-700);
      cursor: pointer;
      transition: all var(--transition-fast);
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      min-width: 120px;
    }

    .modal-filter-select:hover {
      border-color: var(--gray-300);
    }

    .modal-filter-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-4);
    }

    .extrato-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .extrato-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      background: var(--gray-50);
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);
    }

    .extrato-item:hover {
      background: var(--gray-100);
    }

    .extrato-item.high-value {
      background: var(--danger-50);
      border: 1px solid var(--danger-200);
    }

    .extrato-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 44px;
      padding: var(--spacing-2);
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
    }

    .date-day {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1;
    }

    .date-month {
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--gray-500);
      text-transform: uppercase;
    }

    .extrato-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-base);
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
    }

    .extrato-icon.high-value {
      background: var(--danger-100);
      border-color: var(--danger-300);
    }

    .extrato-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .extrato-desc {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-800);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .extrato-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    .extrato-category {
      font-size: var(--font-size-xs);
      padding: 2px 8px;
      background: var(--primary-100);
      color: var(--primary-700);
      border-radius: var(--radius-sm);
      font-weight: 500;
    }

    .extrato-payment {
      font-size: var(--font-size-xs);
      padding: 2px 8px;
      background: var(--success-100);
      color: var(--success-700);
      border-radius: var(--radius-sm);
      font-weight: 500;
    }

    .extrato-payment.credit {
      background: var(--warning-100);
      color: var(--warning-700);
    }

    .extrato-type {
      font-size: var(--font-size-xs);
      padding: 2px 8px;
      background: var(--gray-200);
      color: var(--gray-700);
      border-radius: var(--radius-sm);
      font-weight: 500;
    }

    .extrato-value {
      text-align: right;
    }

    .value-amount {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--danger-600);
    }

    .btn-delete {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--gray-400);
      transition: all var(--transition-fast);
    }

    .btn-delete:hover {
      background: var(--danger-100);
      color: var(--danger-600);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-8);
      text-align: center;
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

    .empty-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--gray-700);
      margin: 0 0 var(--spacing-1) 0;
    }

    .empty-desc {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .modal-footer {
      padding: var(--spacing-4);
      border-top: 1px solid var(--gray-100);
      display: flex;
      justify-content: center;
    }

    .btn-clear-all {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) var(--spacing-4);
      border: 1px solid var(--danger-200);
      background: var(--danger-50);
      color: var(--danger-600);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-clear-all:hover {
      background: var(--danger-100);
      border-color: var(--danger-300);
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

    .sidebar.sidebar-collapsed .user-info {
      justify-content: center;
      padding: var(--spacing-3);
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
      transition: margin-left var(--transition-base);
    }

    .main-content.sidebar-closed {
      margin-left: 0;
    }

    .main-content.sidebar-collapsed {
      margin-left: 80px;
    }

    .menu-toggle {
      display: none;
      width: 40px;
      height: 40px;
      border: none;
      background: var(--gray-100);
      border-radius: var(--radius-md);
      color: var(--gray-700);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .menu-toggle:hover {
      background: var(--gray-200);
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
        transform: translateX(-100%);
        width: 260px;
      }

      .sidebar.sidebar-open {
        transform: translateX(0);
      }

      .sidebar.sidebar-collapsed {
        width: 260px;
      }

      .sidebar-overlay {
        display: block;
      }

      .sidebar-toggle-btn {
        display: none;
      }

      .sidebar-close-btn {
        display: flex;
      }
      
      .main-content {
        margin-left: 0;
      }

      .main-content.sidebar-collapsed {
        margin-left: 0;
      }

      .menu-toggle {
        display: flex;
      }
      
      .top-header {
        flex-wrap: wrap;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
      }
      
      .header-left {
        flex: 1;
        min-width: 0;
      }

      .page-title {
        font-size: var(--font-size-base);
      }

      .page-subtitle {
        font-size: var(--font-size-xs);
      }
      
      .header-center {
        width: 100%;
        order: 3;
      }
      
      .filter-row {
        flex-direction: column;
        width: 100%;
        gap: var(--spacing-2);
      }
      
      .btn-group {
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
      }

      .filter-btn {
        flex: 1;
        min-width: 80px;
      }
      
      .filter-select {
        width: 100%;
      }
      
      .header-right {
        width: 100%;
        order: 2;
        justify-content: flex-start;
      }

      .quick-stat {
        padding: var(--spacing-2);
      }

      .quick-stat-label {
        font-size: 10px;
      }

      .quick-stat-value {
        font-size: var(--font-size-sm);
      }
      
      .dashboard-content {
        padding: var(--spacing-3);
        gap: var(--spacing-3);
      }

      .metrics-section {
        grid-template-columns: 1fr;
        gap: var(--spacing-2);
      }

      .charts-section {
        grid-template-columns: 1fr;
        gap: var(--spacing-2);
      }

      .management-section {
        grid-template-columns: 1fr;
        gap: var(--spacing-2);
      }

      .forms-wrapper {
        grid-template-columns: 1fr;
      }

      .modal-content {
        max-width: 95%;
        max-height: 90vh;
        margin: var(--spacing-2);
      }

      .modal-summary {
        grid-template-columns: 1fr;
        gap: var(--spacing-2);
      }

      .summary-filter {
        align-items: flex-start;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 100%;
        max-width: 280px;
      }

      .logo-title {
        font-size: var(--font-size-base);
      }

      .logo-subtitle {
        font-size: 10px;
      }

      .nav-item-extrato {
        padding: var(--spacing-2);
      }

      .extrato-icon-wrapper {
        width: 32px;
        height: 32px;
      }

      .extrato-title {
        font-size: var(--font-size-xs);
      }

      .extrato-subtitle {
        font-size: 10px;
      }

      .dashboard-content {
        padding: var(--spacing-2);
      }

      .top-header {
        padding: var(--spacing-2);
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private expenseService = inject(ExpenseService);
  totalDespesas$ = this.expenseService.totalDespesas$;
  anoSelecionado$ = this.expenseService.anoSelecionado$;
  mesSelecionado$ = this.expenseService.mesSelecionado$;
  anosDisponiveis$ = this.expenseService.anosDisponiveis$;
  receitas$ = this.expenseService.receitas$;
  totalReceitas$ = this.expenseService.totalReceitas$;
  todasDespesas$ = this.expenseService.expenses$;
  despesasFiltradas$ = this.expenseService.despesasFiltradas$;
  categoriaSelecionada$ = this.expenseService.categoriaSelecionada$;
  title = 'FinControl';

  mostrarModalReceitas = signal(false);
  mostrarModalDespesas = signal(false);
  sidebarAberta = signal(false);
  sidebarColapsada = signal(false);

  ngOnInit(): void {
    this.verificarTamanhoTela();
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.verificarTamanhoTela();
  }

  private verificarTamanhoTela(): void {
    if (typeof window !== 'undefined') {
      if (window.innerWidth > 768) {
        this.sidebarAberta.set(true);
        // No desktop, mantém o estado de colapsada se já estava
      } else {
        this.sidebarAberta.set(false);
        this.sidebarColapsada.set(false); // No mobile, não usa colapsada
      }
    }
  }

  toggleSidebarColapsada(): void {
    // Só permite colapsar no desktop
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      this.sidebarColapsada.update(value => !value);
    }
  }

  categorias = ['Todas', ...CATEGORIAS];

  private readonly emojisCategoria: { [key: string]: string } = {
    'Alimentação': '🍔',
    'Transporte': '🚗',
    'Lazer': '🎮',
    'Saúde': '💊',
    'Educação': '📚',
    'Moradia': '🏠',
    'Outros': '📦'
  };

  readonly meses = [
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

  definirFiltroAno(ano: number | null): void {
    this.expenseService.definirFiltroAno(ano);
  }

  aoMudarMes(valor: string): void {
    if (valor === 'all') {
      this.expenseService.definirFiltroMes(null);
    } else {
      this.expenseService.definirFiltroMes(parseInt(valor, 10));
    }
  }

  abrirModalReceitas(): void {
    this.mostrarModalReceitas.set(true);
  }

  fecharModalReceitas(): void {
    this.mostrarModalReceitas.set(false);
  }

  abrirModalDespesas(): void {
    this.mostrarModalDespesas.set(true);
  }

  fecharModalDespesas(): void {
    this.mostrarModalDespesas.set(false);
  }

  removerReceita(id: string): void {
    this.expenseService.removerReceita(id);
  }

  limparTodasReceitas(): void {
    if (confirm('Tem certeza que deseja remover todas as receitas?')) {
      const receitas = this.receitas$();
      receitas.forEach(receita => {
        this.expenseService.removerReceita(receita.id);
      });
      this.fecharModalReceitas();
    }
  }

  removerDespesa(id: string): void {
    this.expenseService.removerDespesa(id);
  }

  limparTodasDespesas(): void {
    if (confirm('Tem certeza que deseja remover todas as despesas?')) {
      this.expenseService.limparTodasDespesas();
      this.fecharModalDespesas();
    }
  }

  aoMudarCategoria(categoria: string): void {
    this.expenseService.definirFiltroCategoria(categoria);
  }

  obterEmojiCategoria(categoria: string): string {
    return this.emojisCategoria[categoria] || '📦';
  }

  ehAltoValor(valor: number): boolean {
    return valor >= 500;
  }

  toggleSidebar(): void {
    this.sidebarAberta.update(value => !value);
  }
}
