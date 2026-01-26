/**
 * Modelo que representa uma despesa
 */
export interface Expense {
  id: string;
  description: string;
  value: number;
  category: string;
  date: Date;
  paymentType: 'débito' | 'crédito' | 'pix' | 'dinheiro';
  expenseType?: 'fixa' | 'variável'; // Nova propriedade: tipo de despesa
  dueDate?: Date; // Data de vencimento para despesas fixas
}

/**
 * Modelo que representa uma receita
 */
export interface Income {
  id: string;
  description: string;
  value: number;
  date: Date;
  category?: string;
}

/**
 * Modelo que representa um orçamento mensal por categoria
 */
export interface Budget {
  category: string;
  monthlyLimit: number;
  month: number; // 0-11 (janeiro a dezembro)
  year: number;
}

/**
 * Categorias disponíveis para despesas
 */
export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Outros'
] as const;

export type Category = typeof CATEGORIES[number];

/**
 * Interface para dados do gráfico
 */
export interface ChartData {
  category: string;
  total: number;
}
