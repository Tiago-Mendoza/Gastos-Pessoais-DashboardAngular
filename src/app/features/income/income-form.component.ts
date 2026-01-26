import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="income-card">
      <div class="income-header">
        <div class="income-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="income-title-section">
          <h3 class="income-title">Nova Receita</h3>
          <p class="income-subtitle">Adicione suas entradas</p>
        </div>
      </div>

      <form (ngSubmit)="addIncome()" class="income-form">
        <div class="form-group">
          <label for="incomeDescription">Descrição</label>
          <input
            type="text"
            id="incomeDescription"
            [(ngModel)]="description"
            name="incomeDescription"
            placeholder="Ex: Salário, Freelance"
            required
          />
        </div>

        <div class="form-group">
          <label for="incomeValue">Valor</label>
          <div class="input-with-prefix">
            <span class="input-prefix">R$</span>
            <input
              type="number"
              id="incomeValue"
              [(ngModel)]="value"
              name="incomeValue"
              placeholder="0,00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn-submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Adicionar Receita
        </button>
      </form>
    </div>
  `,
  styles: [`
    .income-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-3);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .income-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-3);
      padding-bottom: var(--spacing-2);
      border-bottom: 1px solid var(--gray-100);
    }

    .income-icon {
      width: 32px;
      height: 32px;
      background: var(--success-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--success-600);
    }

    .income-title-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .income-title {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .income-subtitle {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .income-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      flex: 1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .form-group label {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--gray-700);
    }

    .form-group input {
      padding: var(--spacing-2);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      transition: all var(--transition-fast);
      background: var(--gray-50);
    }

    .form-group input:hover {
      border-color: var(--gray-300);
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--success-500);
      background: white;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-group input::placeholder {
      color: var(--gray-400);
    }

    .input-with-prefix {
      display: flex;
      align-items: center;
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .input-with-prefix:hover {
      border-color: var(--gray-300);
    }

    .input-with-prefix:focus-within {
      border-color: var(--success-500);
      background: white;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .input-prefix {
      padding: var(--spacing-2);
      padding-right: 0;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--gray-500);
    }

    .input-with-prefix input {
      border: none;
      background: transparent;
      box-shadow: none;
    }

    .input-with-prefix input:focus {
      box-shadow: none;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-1);
      padding: var(--spacing-2) var(--spacing-3);
      background: linear-gradient(135deg, var(--success-500), var(--success-600));
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-top: auto;
    }

    .btn-submit:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-submit:active {
      transform: translateY(0);
    }
  `]
})
export class IncomeFormComponent {
  private expenseService = inject(ExpenseService);
  
  description = '';
  value = 0;

  addIncome(): void {
    if (!this.description.trim() || this.value <= 0) {
      return;
    }

    this.expenseService.addIncome(this.description.trim(), this.value);
    
    this.description = '';
    this.value = 0;
  }
}
