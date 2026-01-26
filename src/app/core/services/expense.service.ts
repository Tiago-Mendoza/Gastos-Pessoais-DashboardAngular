import { Injectable, signal, computed } from '@angular/core';
import { Expense, CATEGORIES, ChartData, Income, Budget } from '../../models/expense.model';

/**
 * Service responsável por gerenciar as despesas usando Signals
 * 
 * Signals são uma forma moderna de gerenciar estado reativo no Angular 20.
 * Eles são mais simples e performáticos que Observables para casos simples.
 */
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  // Signal que armazena a lista de despesas
  // Usando signal() criamos um estado reativo que pode ser lido e modificado
  private readonly _expenses = signal<Expense[]>([]);

  // Exposição pública do signal (readonly para evitar modificações diretas)
  // O $ no final é uma convenção para indicar que é um signal
  readonly expenses$ = this._expenses.asReadonly();

  // Signal para armazenar a categoria filtrada
  private readonly _selectedCategory = signal<string>('Todas');

  // Exposição pública do filtro
  readonly selectedCategory$ = this._selectedCategory.asReadonly();

  // Signals para filtros de data
  private readonly _selectedYear = signal<number | null>(null);
  private readonly _selectedMonth = signal<number | null>(null);

  // Exposição pública dos filtros de data
  readonly selectedYear$ = this._selectedYear.asReadonly();
  readonly selectedMonth$ = this._selectedMonth.asReadonly();

  // Signals para receitas e orçamentos
  private readonly _incomes = signal<Income[]>([]);
  private readonly _budgets = signal<Budget[]>([]);

  readonly incomes$ = this._incomes.asReadonly();
  readonly budgets$ = this._budgets.asReadonly();

  // Computed signal que retorna despesas filtradas por data
  readonly filteredByDateExpenses$ = computed(() => {
    let expenses = this._expenses();
    const year = this._selectedYear();
    const month = this._selectedMonth();

    if (year !== null) {
      expenses = expenses.filter((expense: Expense) => expense.date.getFullYear() === year);
    }

    if (month !== null) {
      expenses = expenses.filter((expense: Expense) => expense.date.getMonth() === month);
    }

    return expenses;
  });

  // Computed signal que calcula o total de gastos automaticamente (considerando filtros de data)
  // computed() cria um signal derivado que recalcula automaticamente
  // quando qualquer signal dependente muda
  readonly totalExpenses$ = computed(() => {
    return this.filteredByDateExpenses$().reduce((total: number, expense: Expense) => total + expense.value, 0);
  });

  // Computed signal para despesas filtradas (por categoria e data)
  readonly filteredExpenses$ = computed(() => {
    let expenses = this.filteredByDateExpenses$();
    const category = this._selectedCategory();
    
    if (category === 'Todas') {
      return expenses;
    }
    
    return expenses.filter((expense: Expense) => expense.category === category);
  });

  // Computed signal para dados do gráfico por categoria (considerando filtros de data)
  // Este computed() agrupa as despesas por categoria e calcula o total de cada uma
  readonly chartData$ = computed(() => {
    const expenses = this.filteredByDateExpenses$();
    
    if (expenses.length === 0) {
      return [];
    }

    // Agrupa despesas por categoria e calcula o total de cada categoria
    const categoryTotals = new Map<string, number>();
    
    expenses.forEach((expense: Expense) => {
      const currentTotal = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, currentTotal + expense.value);
    });

    // Converte para array de ChartData
    const chartData: ChartData[] = Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total
    }));

    // Ordena por total (maior primeiro)
    return chartData.sort((a, b) => b.total - a.total);
  });

  // Computed signal para total de gastos no débito (considerando filtros de data)
  readonly totalDebito$ = computed(() => {
    return this.filteredByDateExpenses$()
      .filter((expense: Expense) => expense.paymentType === 'débito')
      .reduce((total: number, expense: Expense) => total + expense.value, 0);
  });

  // Computed signal para total de gastos no crédito (considerando filtros de data)
  readonly totalCredito$ = computed(() => {
    return this.filteredByDateExpenses$()
      .filter((expense: Expense) => expense.paymentType === 'crédito')
      .reduce((total: number, expense: Expense) => total + expense.value, 0);
  });

  // Computed signal para dados do histograma mensal
  // Retorna dados agrupados por mês com totais: Geral, Débito e Crédito
  // Considera filtros de data se aplicados
  readonly monthlyHistogramData$ = computed(() => {
    let expenses = this._expenses();
    const year = this._selectedYear();
    const month = this._selectedMonth();
    
    // Se há filtro de ano, filtra apenas esse ano
    if (year !== null) {
      expenses = expenses.filter((expense: Expense) => expense.date.getFullYear() === year);
    }
    
    // Se há filtro de mês, filtra apenas esse mês
    // Quando um mês específico é selecionado, o histograma deve mostrar apenas esse mês
    if (month !== null) {
      expenses = expenses.filter((expense: Expense) => expense.date.getMonth() === month);
      
      // Se há filtro de mês, retorna apenas um item com os dados daquele mês
      if (expenses.length === 0) {
        return [];
      }
      
      // Calcula totais para o mês filtrado
      let geral = 0;
      let debito = 0;
      let credito = 0;
      
      expenses.forEach((expense: Expense) => {
        geral += expense.value;
        
        if (expense.paymentType === 'débito') {
          debito += expense.value;
        } else if (expense.paymentType === 'crédito') {
          credito += expense.value;
        }
      });
      
      // Retorna um único item com o nome do mês
      const monthName = expenses[0].date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return [{
        month: monthName,
        geral: geral,
        debito: debito,
        credito: credito
      }];
    }
    
    if (expenses.length === 0) {
      return [];
    }

    // Agrupa despesas por mês/ano (quando não há filtro de mês)
    const monthlyData = new Map<string, { monthKey: string; geral: number; debito: number; credito: number }>();
    
    expenses.forEach((expense: Expense) => {
      const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = expense.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(monthName)) {
        monthlyData.set(monthName, { monthKey, geral: 0, debito: 0, credito: 0 });
      }
      
      const data = monthlyData.get(monthName)!;
      data.geral += expense.value;
      
      if (expense.paymentType === 'débito') {
        data.debito += expense.value;
      } else if (expense.paymentType === 'crédito') {
        data.credito += expense.value;
      }
    });

    // Converte para array e ordena por data
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        geral: data.geral,
        debito: data.debito,
        credito: data.credito,
        monthKey: data.monthKey
      }))
      .sort((a, b) => {
        // Ordena por monthKey (mais recente primeiro)
        return b.monthKey.localeCompare(a.monthKey);
      })
      .slice(0, 12) // Últimos 12 meses
      .map(({ monthKey, ...rest }) => rest); // Remove monthKey do resultado final
  });

  constructor() {
    // Carrega dados do localStorage ao inicializar
    this.loadFromLocalStorage();
  }

  /**
   * Adiciona uma nova despesa
   */
  addExpense(
    description: string, 
    value: number, 
    category: string, 
    paymentType: 'débito' | 'crédito' | 'pix' | 'dinheiro',
    expenseType?: 'fixa' | 'variável',
    dueDate?: Date,
    date?: Date
  ): void {
    const newExpense: Expense = {
      id: this.generateId(),
      description,
      value,
      category,
      date: date || new Date(),
      paymentType,
      expenseType: expenseType || 'variável',
      dueDate
    };

    // Atualiza o signal usando update() que recebe a função de atualização
    this._expenses.update((expenses: Expense[]) => [...expenses, newExpense]);
    this.saveToLocalStorage();
  }

  /**
   * Adiciona uma nova receita
   */
  addIncome(description: string, value: number, category?: string): void {
    const newIncome: Income = {
      id: this.generateId(),
      description,
      value,
      date: new Date(),
      category: category || 'Outros'
    };

    this._incomes.update((incomes: Income[]) => [...incomes, newIncome]);
    this.saveIncomesAndBudgets();
  }

  /**
   * Remove uma receita
   */
  removeIncome(id: string): void {
    this._incomes.update((incomes: Income[]) => incomes.filter((inc: Income) => inc.id !== id));
    this.saveIncomesAndBudgets();
  }

  /**
   * Define orçamento mensal para uma categoria
   */
  setBudget(category: string, monthlyLimit: number, month: number, year: number): void {
    const budgets = this._budgets();
    const existingIndex = budgets.findIndex(
      (b: Budget) => b.category === category && b.month === month && b.year === year
    );

    const newBudget: Budget = { category, monthlyLimit, month, year };

    if (existingIndex >= 0) {
      this._budgets.update((budgets: Budget[]) => {
        const updated = [...budgets];
        updated[existingIndex] = newBudget;
        return updated;
      });
    } else {
      this._budgets.update((budgets: Budget[]) => [...budgets, newBudget]);
    }
    this.saveToLocalStorage();
  }

  /**
   * Remove uma despesa pelo ID
   */
  removeExpense(id: string): void {
    this._expenses.update((expenses: Expense[]) => expenses.filter((exp: Expense) => exp.id !== id));
    this.saveToLocalStorage();
  }

  /**
   * Remove todas as despesas
   */
  clearAllExpenses(): void {
    this._expenses.set([]);
    this.saveToLocalStorage();
  }

  /**
   * Define a categoria para filtro
   */
  setCategoryFilter(category: string): void {
    this._selectedCategory.set(category);
  }

  /**
   * Define o ano para filtro
   */
  setYearFilter(year: number | null): void {
    this._selectedYear.set(year);
  }

  /**
   * Define o mês para filtro
   */
  setMonthFilter(month: number | null): void {
    this._selectedMonth.set(month);
  }

  /**
   * Obtém lista de anos disponíveis nas despesas
   */
  readonly availableYears$ = computed(() => {
    const expenses = this._expenses();
    const years = new Set<number>();
    
    expenses.forEach((expense: Expense) => {
      years.add(expense.date.getFullYear());
    });
    
    return Array.from(years).sort((a, b) => b - a); // Ordena do mais recente para o mais antigo
  });

  /**
   * Gera um ID único para a despesa
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Salva as despesas no localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const expenses = this._expenses();
      // Converte Date para string para serialização
      const serialized = expenses.map(exp => ({
        ...exp,
        date: exp.date.toISOString(),
        dueDate: exp.dueDate ? exp.dueDate.toISOString() : undefined
      }));
      localStorage.setItem('expenses', JSON.stringify(serialized));
      this.saveIncomesAndBudgets();
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Carrega as despesas do localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('expenses');
      if (stored) {
        const expenses = JSON.parse(stored) as Array<Omit<Expense, 'date'> & { date: string }>;
        // Converte string de volta para Date
        const parsedExpenses: Expense[] = expenses.map(exp => ({
          id: exp.id,
          description: exp.description,
          value: exp.value,
          category: exp.category,
          date: new Date(exp.date),
          paymentType: exp.paymentType || 'débito', // Default para compatibilidade com dados antigos
          expenseType: exp.expenseType || 'variável',
          dueDate: exp.dueDate ? new Date(exp.dueDate) : undefined
        }));
        this._expenses.set(parsedExpenses);
      }

      // Carrega receitas
      const storedIncomes = localStorage.getItem('incomes');
      if (storedIncomes) {
        const incomes = JSON.parse(storedIncomes) as Array<Omit<Income, 'date'> & { date: string }>;
        const parsedIncomes: Income[] = incomes.map(inc => ({
          ...inc,
          date: new Date(inc.date)
        }));
        this._incomes.set(parsedIncomes);
      }

      // Carrega orçamentos
      const storedBudgets = localStorage.getItem('budgets');
      if (storedBudgets) {
        const budgets = JSON.parse(storedBudgets) as Budget[];
        this._budgets.set(budgets);
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
  }

  /**
   * Salva receitas e orçamentos no localStorage
   */
  private saveIncomesAndBudgets(): void {
    try {
      const incomes = this._incomes();
      const serializedIncomes = incomes.map(inc => ({
        ...inc,
        date: inc.date.toISOString()
      }));
      localStorage.setItem('incomes', JSON.stringify(serializedIncomes));

      const budgets = this._budgets();
      localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
      console.error('Erro ao salvar receitas/orçamentos:', error);
    }
  }

  /**
   * Computed signal para total de receitas
   */
  readonly totalIncomes$ = computed(() => {
    return this._incomes().reduce((total: number, income: Income) => total + income.value, 0);
  });

  /**
   * Computed signal para saldo (Receitas - Despesas)
   */
  readonly balance$ = computed(() => {
    return this.totalIncomes$() - this.totalExpenses$();
  });

  /**
   * Computed signal para dados de orçamento por categoria
   */
  readonly budgetData$ = computed(() => {
    const expenses = this.filteredByDateExpenses$();
    const budgets = this._budgets();
    const selectedMonth = this._selectedMonth();
    const selectedYear = this._selectedYear();
    
    // Se não há filtro de mês, usa o mês atual
    const currentMonth = selectedMonth !== null ? selectedMonth : new Date().getMonth();
    // Se não há filtro de ano, usa o ano atual
    const currentYear = selectedYear !== null ? selectedYear : new Date().getFullYear();

    const categoryTotals = new Map<string, number>();
    expenses.forEach((expense: Expense) => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.value);
    });

    return CATEGORIES.map(category => {
      const spent = categoryTotals.get(category) || 0;
      const budget = budgets.find(
        (b: Budget) => b.category === category && b.month === currentMonth && b.year === currentYear
      );
      const limit = budget?.monthlyLimit || 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok';

      return {
        category,
        spent,
        limit,
        percentage,
        status
      };
    });
  });

  /**
   * Computed signal para próximos vencimentos (próximos 7 dias)
   */
  readonly upcomingDueDates$ = computed(() => {
    const expenses = this._expenses();
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return expenses
      .filter((expense: Expense) => {
        if (!expense.dueDate || expense.expenseType !== 'fixa') return false;
        const dueDate = new Date(expense.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
      })
      .sort((a, b) => {
        const dateA = a.dueDate!.getTime();
        const dateB = b.dueDate!.getTime();
        return dateA - dateB;
      })
      .slice(0, 5); // Próximos 5 vencimentos
  });

  /**
   * Computed signal para gráfico de tendência (evolução do patrimônio)
   */
  readonly trendData$ = computed(() => {
    const expenses = this._expenses();
    const incomes = this._incomes();
    
    // Agrupa por mês/ano
    const monthlyData = new Map<string, { income: number; expense: number; balance: number }>();
    
    incomes.forEach((income: Income) => {
      const key = `${income.date.getFullYear()}-${String(income.date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = income.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!monthlyData.has(monthName)) {
        monthlyData.set(monthName, { income: 0, expense: 0, balance: 0 });
      }
      const data = monthlyData.get(monthName)!;
      data.income += income.value;
    });

    expenses.forEach((expense: Expense) => {
      const key = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = expense.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!monthlyData.has(monthName)) {
        monthlyData.set(monthName, { income: 0, expense: 0, balance: 0 });
      }
      const data = monthlyData.get(monthName)!;
      data.expense += expense.value;
    });

    // Calcula saldo acumulado
    let cumulativeBalance = 0;
    return Array.from(monthlyData.entries())
      .map(([month, data]) => {
        cumulativeBalance += data.income - data.expense;
        return {
          month,
          income: data.income,
          expense: data.expense,
          balance: cumulativeBalance
        };
      })
      .sort((a, b) => {
        // Ordena por data
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-12); // Últimos 12 meses
  });
}
