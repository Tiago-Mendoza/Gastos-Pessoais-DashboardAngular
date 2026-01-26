# 📚 Documentação: Signals e computed() no Projeto

## 🔍 Como Signals e computed() Estão Sendo Usados

### 1. Signals no ExpenseService

#### O que são Signals?

Signals são uma primitiva reativa do Angular 20 que permite criar estado reativo de forma mais simples e performática que Observables. Eles são especialmente úteis para gerenciamento de estado local e simples.

#### Implementação no Projeto

```typescript
// src/app/core/services/expense.service.ts

// 1. Signal privado para armazenar as despesas
private readonly _expenses = signal<Expense[]>([]);

// 2. Exposição pública como readonly (impede modificação direta)
readonly expenses$ = this._expenses.asReadonly();

// 3. Signal para filtro de categoria
private readonly _selectedCategory = signal<string>('Todas');
readonly selectedCategory$ = this._selectedCategory.asReadonly();
```

#### Como Funciona?

- **`signal<T>(initialValue)`**: Cria um signal com valor inicial
- **`signal()`**: Lê o valor atual do signal (chamada de função)
- **`signal.set(newValue)`**: Define um novo valor
- **`signal.update(fn)`**: Atualiza baseado no valor anterior
- **`signal.asReadonly()`**: Cria uma versão somente leitura

#### Exemplo de Uso:

```typescript
// Adicionar despesa
addExpense(description: string, value: number, category: string): void {
  const newExpense: Expense = { /* ... */ };
  
  // Atualiza o signal usando update()
  // A função recebe o valor atual e retorna o novo valor
  this._expenses.update((expenses: Expense[]) => [...expenses, newExpense]);
}
```

### 2. computed() para Cálculos Automáticos

#### O que é computed()?

`computed()` cria um **signal derivado** que recalcula automaticamente sempre que qualquer signal dependente muda. É similar ao `computed` do Vue.js ou `useMemo` do React.

#### Implementação no Projeto

```typescript
// Calcula o total de gastos automaticamente
readonly totalExpenses$ = computed(() => {
  return this._expenses().reduce((total: number, expense: Expense) => 
    total + expense.value, 0
  );
});

// Filtra despesas baseado na categoria selecionada
readonly filteredExpenses$ = computed(() => {
  const expenses = this._expenses();
  const category = this._selectedCategory();
  
  if (category === 'Todas') {
    return expenses;
  }
  
  return expenses.filter((expense: Expense) => expense.category === category);
});

// Dados do gráfico agrupados por categoria
readonly chartData$ = computed(() => {
  const expenses = this._expenses();
  
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

  return chartData.sort((a, b) => b.total - a.total);
});
```

#### Como Funciona?

1. **Dependências automáticas**: O `computed()` detecta automaticamente quais signals estão sendo lidos dentro da função
2. **Recálculo inteligente**: Só recalcula quando uma dependência muda
3. **Cache**: O valor é cacheado até que uma dependência mude
4. **Lazy evaluation**: Só calcula quando o valor é acessado

#### Fluxo de Execução:

```
1. Usuário adiciona despesa
   ↓
2. _expenses.update() é chamado
   ↓
3. _expenses signal muda
   ↓
4. totalExpenses$ detecta a mudança automaticamente
   ↓
5. totalExpenses$ recalcula o total
   ↓
6. chartData$ também recalcula (agrupa por categoria)
   ↓
7. Template e gráfico são atualizados automaticamente
```

### 3. effect() para Atualização do Gráfico

#### O que é effect()?

`effect()` executa código automaticamente quando qualquer signal dependente muda. É usado para efeitos colaterais (side effects) como atualizar o DOM, fazer chamadas de API, etc.

#### Implementação no Componente do Gráfico

```typescript
// src/app/features/chart/expense-chart.component.ts

constructor() {
  // Usa effect() do Angular 20 para observar mudanças no chartData$
  effect(() => {
    // Lê o signal para criar a dependência
    const data = this.chartData$();
    
    // Se o gráfico já foi criado, atualiza; senão, cria
    const chart = this.chartInstance();
    if (chart) {
      this.updateChart();
    } else if (this.canvasRef()) {
      setTimeout(() => this.createChart(), 0);
    }
  });
}
```

#### Como Funciona?

1. **Dependências automáticas**: `effect()` detecta quais signals são lidos
2. **Execução automática**: Executa quando qualquer dependência muda
3. **Gerenciamento de ciclo de vida**: Angular gerencia automaticamente quando criar/destruir o effect
4. **Sem memory leaks**: Não precisa de unsubscribe manual

## 🔄 Por que essa Abordagem é Considerada Angular Moderno?

### Comparação: Angular Antigo vs Angular Moderno

#### 1. Gerenciamento de Estado

**❌ Angular Antigo (RxJS):**
```typescript
private expensesSubject = new BehaviorSubject<Expense[]>([]);
expenses$ = this.expensesSubject.asObservable();

totalExpenses$ = this.expenses$.pipe(
  map(expenses => expenses.reduce((total, exp) => total + exp.value, 0))
);

// No template
{{ totalExpenses$ | async | currency }}
```

**✅ Angular Moderno (Signals):**
```typescript
private readonly _expenses = signal<Expense[]>([]);
readonly expenses$ = this._expenses.asReadonly();

readonly totalExpenses$ = computed(() => {
  return this._expenses().reduce((total, expense) => total + expense.value, 0);
});

// No template
{{ totalExpenses$() | brlCurrency }}
```

**Vantagens:**
- Não precisa de pipe `async`
- Mais simples e direto
- Sem memory leaks (gerenciamento automático)
- Melhor performance
- Type-safe

#### 2. Cálculos Derivados

**❌ Angular Antigo:**
```typescript
totalExpenses$ = this.expenses$.pipe(
  map(expenses => expenses.reduce((total, exp) => total + exp.value, 0))
);

chartData$ = this.expenses$.pipe(
  map(expenses => {
    // Lógica complexa de agrupamento
  })
);
```

**✅ Angular Moderno:**
```typescript
readonly totalExpenses$ = computed(() => {
  return this._expenses().reduce((total, expense) => total + expense.value, 0);
});

readonly chartData$ = computed(() => {
  const expenses = this._expenses();
  // Lógica de agrupamento
  // Recalcula automaticamente quando _expenses muda
});
```

**Vantagens:**
- Mais legível
- Cache automático
- Recalcula apenas quando necessário
- Sem necessidade de pipe `async`

#### 3. Efeitos Colaterais

**❌ Angular Antigo:**
```typescript
ngOnInit() {
  this.expenses$.subscribe(expenses => {
    this.updateChart();
  });
}

ngOnDestroy() {
  this.subscription?.unsubscribe(); // Precisa gerenciar manualmente
}
```

**✅ Angular Moderno:**
```typescript
constructor() {
  effect(() => {
    const data = this.chartData$();
    this.updateChart();
  });
  // Gerenciamento automático - sem unsubscribe necessário
}
```

**Vantagens:**
- Gerenciamento automático de ciclo de vida
- Sem necessidade de unsubscribe
- Mais simples e seguro

## 📊 Resumo

### Signals
- ✅ Estado reativo simples e performático
- ✅ Gerenciamento automático de memória
- ✅ Type-safe
- ✅ Fácil de usar e debugar

### computed()
- ✅ Cálculos derivados automáticos
- ✅ Cache inteligente
- ✅ Recalcula apenas quando necessário
- ✅ Sem necessidade de pipes

### effect()
- ✅ Efeitos colaterais automáticos
- ✅ Gerenciamento de ciclo de vida automático
- ✅ Sem memory leaks
- ✅ Mais simples que subscriptions manuais

## 🎯 Benefícios no Projeto

1. **Gráfico Atualiza Automaticamente**: O gráfico usa `effect()` para observar `chartData$`, que é um `computed()` derivado de `_expenses`. Quando uma despesa é adicionada ou removida, o gráfico atualiza automaticamente.

2. **Total Calculado Automaticamente**: O total de gastos é calculado usando `computed()`, garantindo que sempre esteja atualizado.

3. **Filtro Reativo**: O filtro de categoria usa `computed()` para filtrar as despesas automaticamente quando a categoria selecionada muda.

4. **Sem Memory Leaks**: Não há necessidade de gerenciar subscriptions ou fazer unsubscribe manualmente.

5. **Performance**: Signals são mais performáticos que Observables para estado síncrono, e `computed()` só recalcula quando necessário.
