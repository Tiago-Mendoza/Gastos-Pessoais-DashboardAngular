# 💰 Controle de Gastos Pessoais

Aplicação moderna de controle de gastos pessoais desenvolvida com **Angular 20** usando as funcionalidades mais recentes do framework.

## 🚀 Tecnologias e Recursos

- **Angular 20** com Standalone Components
- **Signals** para gerenciamento de estado reativo
- **computed()** para cálculos automáticos
- **effect()** para reatividade automática
- **Novo Control Flow** (@if, @for) ao invés de *ngIf/*ngFor
- **Chart.js** para visualização de dados
- **localStorage** para persistência de dados
- **TypeScript 5.8** com tipagem forte
- Interface moderna e responsiva

## 📋 Funcionalidades

- ✅ Cadastro de despesas com descrição, valor e categoria
- ✅ Listagem de todas as despesas cadastradas
- ✅ Remoção de despesas individuais
- ✅ Filtro por categoria
- ✅ Cálculo automático do total de gastos usando `computed()`
- ✅ **Gráfico de pizza** mostrando gastos por categoria (Chart.js)
- ✅ Atualização automática do gráfico quando despesas mudam
- ✅ Destaque visual para despesas de valor alto (> R$ 500)
- ✅ Botão para limpar todas as despesas
- ✅ Mensagem quando não houver despesas cadastradas
- ✅ Persistência automática no localStorage

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm start
```

3. Acesse `http://localhost:4200` no navegador

## 📁 Estrutura do Projeto

```
src/app
 ├── core
 │   └── services
 │       └── expense.service.ts      # Service com Signals e localStorage
 ├── features
 │   └── expenses
 │       ├── expense.component.ts     # Componente principal
 │       ├── expense.component.html   # Template com @if e @for
 │       └── expense.component.css    # Estilos modernos
 ├── features
 │   └── chart
 │       ├── expense-chart.component.ts    # Componente do gráfico
 │       ├── expense-chart.component.html  # Template do gráfico
 │       └── expense-chart.component.css   # Estilos do gráfico
 ├── models
 │   └── expense.model.ts             # Interface Expense
 ├── shared
 │   └── pipes
 │       └── currency.pipe.ts        # Pipe para formatação de moeda
 ├── app.component.ts                 # Componente raiz
 └── app.routes.ts                    # Configuração de rotas
```

## 🎯 Como Signals e computed() Funcionam

### Signals

**Signals** são uma forma moderna de gerenciar estado reativo no Angular 20. Eles são mais simples e performáticos que Observables para casos de uso simples.

```typescript
// Criando um signal
private readonly _expenses = signal<Expense[]>([]);

// Lendo um signal (no template ou código)
expenses$() // Retorna o valor atual

// Atualizando um signal
this._expenses.set([...]); // Define novo valor
this._expenses.update(expenses => [...expenses, newItem]); // Atualiza baseado no valor anterior
```

### computed()

**computed()** cria um signal derivado que recalcula automaticamente quando qualquer signal dependente muda.

```typescript
// Calcula o total automaticamente quando _expenses muda
readonly totalExpenses$ = computed(() => {
  return this._expenses().reduce((total, expense) => total + expense.value, 0);
});

// Dados do gráfico agrupados por categoria
readonly chartData$ = computed(() => {
  const expenses = this._expenses();
  // Agrupa e calcula totais por categoria
  // Retorna automaticamente quando _expenses muda
});
```

### effect()

**effect()** executa código automaticamente quando signals mudam.

```typescript
// No componente do gráfico
effect(() => {
  const data = this.chartData$(); // Lê o signal
  // Atualiza o gráfico automaticamente quando data muda
  this.updateChart();
});
```

## 📊 Gráfico com Chart.js

O gráfico de pizza é criado usando Chart.js e atualiza automaticamente quando:
- Uma despesa é adicionada
- Uma despesa é removida
- O filtro de categoria muda

Os dados são derivados usando `computed()`, garantindo que o gráfico sempre reflita o estado atual das despesas.

## 🔄 Por que essa Abordagem é Considerada Angular Moderno?

### 1. **Standalone Components**
- Não precisa de NgModule
- Dependências explícitas no componente
- Melhor tree-shaking
- Mais modular

### 2. **Signals ao invés de RxJS**
- Mais simples para estado síncrono
- Sem necessidade de unsubscribe
- Melhor performance
- Type-safe

### 3. **computed() para Cálculos Derivados**
- Cache automático
- Recalcula apenas quando necessário
- Sem necessidade de pipes async
- Mais legível

### 4. **Novo Control Flow**
- Sintaxe mais natural (@if, @for)
- Melhor performance
- Type-safe
- Mais intuitivo

### 5. **effect() para Efeitos Colaterais**
- Reatividade automática
- Gerenciamento de ciclo de vida automático
- Mais simples que subscriptions manuais

## 📝 Categorias Disponíveis

- Alimentação
- Transporte
- Lazer
- Outros

## 🎨 Interface

- Design moderno com gradientes
- Layout responsivo (mobile-first)
- Feedback visual em todas as ações
- Destaque para despesas de alto valor
- Gráfico interativo com Chart.js
- Animações suaves

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/controle-de-gastos-pessoais`.

## 📄 Licença

Este projeto é de código aberto e está disponível para uso livre.
