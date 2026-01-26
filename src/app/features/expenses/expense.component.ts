import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { CATEGORIES } from '../../models/expense.model';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css'
})
export class ExpenseComponent {
  private expenseService = inject(ExpenseService);

  expenses$ = this.expenseService.filteredExpenses$;
  totalExpenses$ = this.expenseService.totalExpenses$;
  selectedCategory$ = this.expenseService.selectedCategory$;

  categories = ['Todas', ...CATEGORIES];
  readonly CATEGORIES = CATEGORIES;

  description = '';
  value = 0;
  selectedCategory = CATEGORIES[0];
  paymentType: 'débito' | 'crédito' | 'pix' = 'débito';
  expenseType: 'fixa' | 'variável' = 'variável';
  dueDate: string = '';
  expenseMonth: string = this.getCurrentMonthYear();

  private getCurrentMonthYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private readonly categoryEmojis: { [key: string]: string } = {
    'Alimentação': '🍔',
    'Transporte': '🚗',
    'Lazer': '🎮',
    'Saúde': '💊',
    'Educação': '📚',
    'Moradia': '🏠',
    'Outros': '📦'
  };

  selectDebitoPix(): void {
    if (this.paymentType === 'débito') {
      this.paymentType = 'pix';
    } else {
      this.paymentType = 'débito';
    }
  }

  addExpense(): void {
    if (!this.description.trim() || this.value <= 0) {
      return;
    }

    const dueDateObj = this.expenseType === 'fixa' && this.dueDate ? new Date(this.dueDate) : undefined;
    
    // Cria uma data a partir do mês/ano selecionado (primeiro dia do mês)
    let expenseDateObj: Date | undefined = undefined;
    if (this.expenseMonth) {
      const [year, month] = this.expenseMonth.split('-').map(Number);
      expenseDateObj = new Date(year, month - 1, 1); // mês - 1 porque Date usa 0-11
    }

    this.expenseService.addExpense(
      this.description.trim(),
      this.value,
      this.selectedCategory,
      this.paymentType,
      this.expenseType,
      dueDateObj,
      expenseDateObj
    );

    this.description = '';
    this.value = 0;
    this.selectedCategory = CATEGORIES[0];
    this.paymentType = 'débito';
    this.expenseType = 'variável';
    this.dueDate = '';
    this.expenseMonth = this.getCurrentMonthYear();
  }

  removeExpense(id: string): void {
    this.expenseService.removeExpense(id);
  }

  clearAll(): void {
    if (confirm('Tem certeza que deseja remover todas as despesas?')) {
      this.expenseService.clearAllExpenses();
    }
  }

  onCategoryChange(category: string): void {
    this.expenseService.setCategoryFilter(category);
  }

  isHighValue(value: number): boolean {
    return value > 500;
  }

  getCategoryEmoji(category: string): string {
    return this.categoryEmojis[category] || '📦';
  }
}
