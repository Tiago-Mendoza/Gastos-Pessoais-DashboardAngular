import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="balance-card" [class.positive]="saldo$() >= 0" [class.negative]="saldo$() < 0">
      <div class="balance-header">
        <div class="balance-icon" [class.positive]="saldo$() >= 0" [class.negative]="saldo$() < 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (saldo$() >= 0) {
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            } @else {
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            }
          </svg>
        </div>
        <span class="balance-title">Saldo Atual</span>
        
        <!-- Botão para abrir modal de extrato -->
        <button class="btn-extrato" (click)="abrirModal()" title="Ver extrato">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </button>
      </div>
      
      <div class="balance-amount" [class.positive]="saldo$() >= 0" [class.negative]="saldo$() < 0">
        {{ saldo$() | brlCurrency }}
      </div>
      
      <div class="balance-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-dot income"></div>
          <span class="breakdown-label">Receitas</span>
          <span class="breakdown-value income">{{ totalReceitas$() | brlCurrency }}</span>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-dot expense"></div>
          <span class="breakdown-label">Despesas</span>
          <span class="breakdown-value expense">{{ totalDespesas$() | brlCurrency }}</span>
        </div>
      </div>
      
      <div class="balance-indicator">
        <div class="indicator-bar">
          <div 
            class="indicator-fill" 
            [class.positive]="saldo$() >= 0"
            [class.negative]="saldo$() < 0"
            [style.width.%]="obterLarguraIndicador()"
          ></div>
        </div>
        <span class="indicator-label">
          {{ saldo$() >= 0 ? 'Saldo positivo' : 'Saldo negativo' }}
        </span>
      </div>
    </div>

    <!-- Modal de Extrato -->
    @if (mostrarModal()) {
      <div class="modal-overlay" (click)="fecharModal()">
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
            <button class="btn-close" (click)="fecharModal()">
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

    /* Botão de extrato */
    .btn-extrato {
      margin-left: auto;
      width: 24px;
      height: 24px;
      border: none;
      background: var(--primary-50);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--primary-600);
      transition: all var(--transition-fast);
    }

    .btn-extrato:hover {
      background: var(--primary-100);
      transform: scale(1.05);
    }

    /* Modal Overlay */
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
      max-width: 480px;
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
      grid-template-columns: 1fr 1fr;
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

    .extrato-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
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

    .extrato-category {
      font-size: var(--font-size-xs);
      color: var(--gray-500);
    }

    .extrato-value {
      text-align: right;
    }

    .value-amount {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--success-600);
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
  `]
})
export class BalanceCardComponent {
  private expenseService = inject(ExpenseService);
  
  saldo$ = this.expenseService.saldo$;
  totalReceitas$ = this.expenseService.totalReceitas$;
  totalDespesas$ = this.expenseService.totalDespesas$;
  receitas$ = this.expenseService.receitas$;
  
  mostrarModal = signal(false);

  abrirModal(): void {
    this.mostrarModal.set(true);
  }

  fecharModal(): void {
    this.mostrarModal.set(false);
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
      this.fecharModal();
    }
  }

  obterLarguraIndicador(): number {
    const receita = this.totalReceitas$();
    const despesa = this.totalDespesas$();
    const total = receita + despesa;
    if (total === 0) return 50;
    return Math.min(100, Math.max(0, (receita / total) * 100));
  }
}
