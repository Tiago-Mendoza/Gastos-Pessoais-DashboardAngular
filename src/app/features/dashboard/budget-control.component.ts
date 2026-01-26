import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-budget-control',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  template: `
    <div class="budget-card">
      <div class="budget-header">
        <div class="budget-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="budget-title-section">
          <h3 class="budget-title">Controle de Orçamento</h3>
          <p class="budget-subtitle">Defina limites por categoria</p>
        </div>
      </div>

      <div class="budget-list">
        @for (item of dadosOrcamento$(); track item.categoria) {
          <div class="budget-item" [class.warning]="item.status === 'warning'" [class.exceeded]="item.status === 'exceeded'">
            <div class="budget-item-header">
              <span class="budget-category">{{ item.categoria }}</span>
              <div class="budget-input-wrapper">
                <span class="currency-symbol">R$</span>
                <input
                  type="number"
                  class="budget-input"
                  [value]="item.limite"
                  (blur)="atualizarOrcamento(item.categoria, $any($event.target).value)"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div class="budget-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  [class.normal]="item.status === 'normal'"
                  [class.warning]="item.status === 'warning'"
                  [class.exceeded]="item.status === 'exceeded'"
                  [style.width.%]="Math.min(item.percentual, 100)"
                ></div>
              </div>
              <span class="progress-text">{{ item.percentual.toFixed(0) }}%</span>
            </div>

            <div class="budget-footer">
              <span class="budget-spent">
                <span class="label">Gasto:</span>
                {{ item.gasto | brlCurrency }}
              </span>
              @if (item.limite > 0) {
                <span class="budget-remaining" [class.exceeded]="item.gasto > item.limite">
                  {{ item.gasto > item.limite ? 'Excedido:' : 'Restante:' }}
                  {{ (item.limite - item.gasto) | brlCurrency }}
                </span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .budget-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-3);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .budget-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-3);
      padding-bottom: var(--spacing-2);
      border-bottom: 1px solid var(--gray-100);
    }

    .budget-icon {
      width: 32px;
      height: 32px;
      background: var(--primary-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-600);
    }

    .budget-title-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .budget-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .budget-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .budget-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      flex: 1;
      overflow-y: auto;
    }

    .budget-item {
      padding: var(--spacing-2);
      border-radius: var(--radius-md);
      background: var(--gray-50);
      border: 1px solid var(--gray-100);
      transition: all var(--transition-fast);
    }

    .budget-item:hover {
      background: white;
      border-color: var(--gray-200);
    }

    .budget-item.warning {
      background: var(--warning-50);
      border-color: var(--warning-100);
    }

    .budget-item.exceeded {
      background: var(--danger-50);
      border-color: var(--danger-100);
    }

    .budget-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-3);
    }

    .budget-category {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-800);
    }

    .budget-input-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      padding: var(--spacing-1) var(--spacing-2);
    }

    .currency-symbol {
      font-size: var(--font-size-xs);
      color: var(--gray-500);
      font-weight: 500;
    }

    .budget-input {
      width: 60px;
      border: none;
      background: transparent;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--gray-800);
      text-align: right;
      outline: none;
    }

    .budget-input:focus {
      color: var(--primary-600);
    }

    .budget-progress {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-2);
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--gray-200);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width var(--transition-slow);
    }

    .progress-fill.normal {
      background: linear-gradient(90deg, var(--success-400), var(--success-500));
    }

    .progress-fill.warning {
      background: linear-gradient(90deg, var(--warning-400), var(--warning-500));
    }

    .progress-fill.exceeded {
      background: linear-gradient(90deg, var(--danger-400), var(--danger-500));
    }

    .progress-text {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--gray-600);
      min-width: 36px;
      text-align: right;
    }

    .budget-footer {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
    }

    .budget-spent {
      color: var(--gray-600);
    }

    .budget-spent .label {
      color: var(--gray-500);
    }

    .budget-remaining {
      font-weight: 600;
      color: var(--success-600);
    }

    .budget-remaining.exceeded {
      color: var(--danger-600);
    }
  `]
})
export class BudgetControlComponent {
  private expenseService = inject(ExpenseService);
  
  dadosOrcamento$ = this.expenseService.dadosOrcamento$;
  Math = Math;

  atualizarOrcamento(categoria: string, valor: string): void {
    const limite = parseFloat(valor) || 0;
    const mesAtual = this.expenseService.mesSelecionado$() ?? new Date().getMonth();
    const anoAtual = this.expenseService.anoSelecionado$() ?? new Date().getFullYear();
    
    this.expenseService.definirOrcamento(categoria, limite, mesAtual, anoAtual);
  }
}
