/**
 * Modelo que representa uma despesa
 */
export interface Expense {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: Date;
  tipoPagamento: 'débito' | 'crédito' | 'pix' | 'dinheiro';
  tipoDespesa?: 'fixa' | 'variável'; // Nova propriedade: tipo de despesa
  dataVencimento?: Date; // Data de vencimento para despesas fixas
}

/**
 * Modelo que representa uma receita
 */
export interface Income {
  id: string;
  descricao: string;
  valor: number;
  data: Date;
  categoria?: string;
}

/**
 * Modelo que representa um orçamento mensal por categoria
 */
export interface Budget {
  categoria: string;
  limiteMensal: number;
  mes: number; // 0-11 (janeiro a dezembro)
  ano: number;
}

/**
 * Categorias disponíveis para despesas
 */
export const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Outros'
] as const;

export type Categoria = typeof CATEGORIAS[number];

/**
 * Interface para dados do gráfico
 */
export interface DadosGrafico {
  categoria: string;
  total: number;
}
