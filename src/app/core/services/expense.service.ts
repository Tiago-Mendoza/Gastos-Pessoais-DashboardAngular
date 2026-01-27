import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Expense, CATEGORIAS, DadosGrafico, Income, Budget } from '../../models/expense.model';

/**
 * Service responsável por gerenciar as despesas usando Signals e HTTP
 * 
 * Signals são uma forma moderna de gerenciar estado reativo no Angular 20.
 * Eles são mais simples e performáticos que Observables para casos simples.
 */
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';
  // Signal que armazena a lista de despesas
  // Usando signal() criamos um estado reativo que pode ser lido e modificado
  private readonly _expenses = signal<Expense[]>([]);

  // Exposição pública do signal (readonly para evitar modificações diretas)
  // O $ no final é uma convenção para indicar que é um signal
  readonly expenses$ = this._expenses.asReadonly();

  // Signal para armazenar a categoria filtrada
  private readonly _categoriaSelecionada = signal<string>('Todas');

  // Exposição pública do filtro
  readonly categoriaSelecionada$ = this._categoriaSelecionada.asReadonly();

  // Signals para filtros de data
  private readonly _anoSelecionado = signal<number | null>(null);
  private readonly _mesSelecionado = signal<number | null>(null);

  // Exposição pública dos filtros de data
  readonly anoSelecionado$ = this._anoSelecionado.asReadonly();
  readonly mesSelecionado$ = this._mesSelecionado.asReadonly();

  // Signals para receitas e orçamentos
  private readonly _receitas = signal<Income[]>([]);
  private readonly _orcamentos = signal<Budget[]>([]);

  readonly receitas$ = this._receitas.asReadonly();
  readonly orcamentos$ = this._orcamentos.asReadonly();

  // Computed signal que retorna despesas filtradas por data
  readonly despesasFiltradasPorData$ = computed(() => {
    let despesas = this._expenses();
    const ano = this._anoSelecionado();
    const mes = this._mesSelecionado();

    if (ano !== null) {
      despesas = despesas.filter((despesa: Expense) => despesa.data.getFullYear() === ano);
    }

    if (mes !== null) {
      despesas = despesas.filter((despesa: Expense) => despesa.data.getMonth() === mes);
    }

    return despesas;
  });

  // Computed signal que calcula o total de gastos automaticamente (considerando filtros de data)
  // computed() cria um signal derivado que recalcula automaticamente
  // quando qualquer signal dependente muda
  readonly totalDespesas$ = computed(() => {
    return this.despesasFiltradasPorData$().reduce((total: number, despesa: Expense) => total + despesa.valor, 0);
  });

  // Computed signal para despesas filtradas (por categoria e data)
  readonly despesasFiltradas$ = computed(() => {
    let despesas = this.despesasFiltradasPorData$();
    const categoria = this._categoriaSelecionada();
    
    if (categoria === 'Todas') {
      return despesas;
    }
    
    return despesas.filter((despesa: Expense) => despesa.categoria === categoria);
  });

  // Computed signal para dados do gráfico por categoria (considerando filtros de data)
  // Este computed() agrupa as despesas por categoria e calcula o total de cada uma
  readonly dadosGrafico$ = computed(() => {
    const despesas = this.despesasFiltradasPorData$();
    
    if (despesas.length === 0) {
      return [];
    }

    // Agrupa despesas por categoria e calcula o total de cada categoria
    const totaisPorCategoria = new Map<string, number>();
    
    despesas.forEach((despesa: Expense) => {
      const totalAtual = totaisPorCategoria.get(despesa.categoria) || 0;
      totaisPorCategoria.set(despesa.categoria, totalAtual + despesa.valor);
    });

    // Converte para array de DadosGrafico
    const dadosGrafico: DadosGrafico[] = Array.from(totaisPorCategoria.entries()).map(([categoria, total]) => ({
      categoria,
      total
    }));

    // Ordena por total (maior primeiro)
    return dadosGrafico.sort((a, b) => b.total - a.total);
  });

  // Computed signal para total de gastos no débito (considerando filtros de data)
  readonly totalDebito$ = computed(() => {
    return this.despesasFiltradasPorData$()
      .filter((despesa: Expense) => despesa.tipoPagamento === 'débito')
      .reduce((total: number, despesa: Expense) => total + despesa.valor, 0);
  });

  // Computed signal para total de gastos no crédito (considerando filtros de data)
  readonly totalCredito$ = computed(() => {
    return this.despesasFiltradasPorData$()
      .filter((despesa: Expense) => despesa.tipoPagamento === 'crédito')
      .reduce((total: number, despesa: Expense) => total + despesa.valor, 0);
  });

  // Computed signal para dados do histograma mensal
  // Retorna dados agrupados por mês com totais: Geral, Débito e Crédito
  // Considera filtros de data se aplicados
  readonly dadosHistogramaMensal$ = computed(() => {
    let despesas = this._expenses();
    const ano = this._anoSelecionado();
    const mes = this._mesSelecionado();
    
    // Se há filtro de ano, filtra apenas esse ano
    if (ano !== null) {
      despesas = despesas.filter((despesa: Expense) => despesa.data.getFullYear() === ano);
    }
    
    // Se há filtro de mês, filtra apenas esse mês
    // Quando um mês específico é selecionado, o histograma deve mostrar apenas esse mês
    if (mes !== null) {
      despesas = despesas.filter((despesa: Expense) => despesa.data.getMonth() === mes);
      
      // Se há filtro de mês, retorna apenas um item com os dados daquele mês
      if (despesas.length === 0) {
        return [];
      }
      
      // Calcula totais para o mês filtrado
      let geral = 0;
      let debito = 0;
      let credito = 0;
      
      despesas.forEach((despesa: Expense) => {
        geral += despesa.valor;
        
        if (despesa.tipoPagamento === 'débito') {
          debito += despesa.valor;
        } else if (despesa.tipoPagamento === 'crédito') {
          credito += despesa.valor;
        }
      });
      
      // Retorna um único item com o nome do mês
      const nomeMes = despesas[0].data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return [{
        mes: nomeMes,
        geral: geral,
        debito: debito,
        credito: credito
      }];
    }
    
    if (despesas.length === 0) {
      return [];
    }

    // Agrupa despesas por mês/ano (quando não há filtro de mês)
    const dadosMensais = new Map<string, { chaveMes: string; geral: number; debito: number; credito: number }>();
    
    despesas.forEach((despesa: Expense) => {
      const chaveMes = `${despesa.data.getFullYear()}-${String(despesa.data.getMonth() + 1).padStart(2, '0')}`;
      const nomeMes = despesa.data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (!dadosMensais.has(nomeMes)) {
        dadosMensais.set(nomeMes, { chaveMes, geral: 0, debito: 0, credito: 0 });
      }
      
      const dados = dadosMensais.get(nomeMes)!;
      dados.geral += despesa.valor;
      
      if (despesa.tipoPagamento === 'débito') {
        dados.debito += despesa.valor;
      } else if (despesa.tipoPagamento === 'crédito') {
        dados.credito += despesa.valor;
      }
    });

    // Converte para array e ordena por data
    return Array.from(dadosMensais.entries())
      .map(([mes, dados]) => ({
        mes,
        geral: dados.geral,
        debito: dados.debito,
        credito: dados.credito,
        chaveMes: dados.chaveMes
      }))
      .sort((a, b) => {
        // Ordena por chaveMes (mais recente primeiro)
        return b.chaveMes.localeCompare(a.chaveMes);
      })
      .slice(0, 12) // Últimos 12 meses
      .map(({ chaveMes, ...resto }) => resto); // Remove chaveMes do resultado final
  });

  constructor() {
    // Carrega dados do backend ao inicializar
    this.carregarDoBackend();
  }

  /**
   * Adiciona uma nova despesa
   */
  adicionarDespesa(
    descricao: string, 
    valor: number, 
    categoria: string, 
    tipoPagamento: 'débito' | 'crédito' | 'pix' | 'dinheiro',
    tipoDespesa?: 'fixa' | 'variável',
    dataVencimento?: Date,
    data?: Date
  ): void {
    const novaDespesa = {
      id: this.gerarId(),
      descricao,
      valor,
      categoria,
      data: (data || new Date()).toISOString(),
      tipoPagamento,
      tipoDespesa: tipoDespesa || 'variável',
      dataVencimento: dataVencimento ? dataVencimento.toISOString() : undefined
    };

    this.http.post(`${this.API_URL}/despesas`, novaDespesa).subscribe({
      next: (despesaCriada: any) => {
        const despesaParseada: Expense = this.parsearDespesa(despesaCriada);
        this._expenses.update((despesas: Expense[]) => [...despesas, despesaParseada]);
      },
      error: (error) => {
        console.error('Erro ao adicionar despesa:', error);
      }
    });
  }

  /**
   * Adiciona uma nova receita
   */
  adicionarReceita(descricao: string, valor: number, categoria?: string): void {
    const novaReceita = {
      id: this.gerarId(),
      descricao,
      valor,
      data: new Date().toISOString(),
      categoria: categoria || 'Outros'
    };

    this.http.post(`${this.API_URL}/receitas`, novaReceita).subscribe({
      next: (receitaCriada: any) => {
        const receitaParseada: Income = this.parsearReceita(receitaCriada);
        this._receitas.update((receitas: Income[]) => [...receitas, receitaParseada]);
      },
      error: (error) => {
        console.error('Erro ao adicionar receita:', error);
      }
    });
  }

  /**
   * Remove uma receita
   */
  removerReceita(id: string): void {
    this.http.delete(`${this.API_URL}/receitas/${id}`).subscribe({
      next: () => {
        this._receitas.update((receitas: Income[]) => receitas.filter((receita: Income) => receita.id !== id));
      },
      error: (error) => {
        console.error('Erro ao remover receita:', error);
      }
    });
  }

  /**
   * Define orçamento mensal para uma categoria
   */
  definirOrcamento(categoria: string, limiteMensal: number, mes: number, ano: number): void {
    const orcamentos = this._orcamentos();
    const orcamentoExistente = orcamentos.find(
      (orcamento: Budget) => orcamento.categoria === categoria && orcamento.mes === mes && orcamento.ano === ano
    );

    const novoOrcamento = { categoria, limiteMensal, mes, ano };

    if (orcamentoExistente) {
      // Busca o ID do orçamento existente (json-server adiciona _id ou id)
      const id = (orcamentoExistente as any).id || (orcamentoExistente as any)._id;
      if (id) {
        this.http.put(`${this.API_URL}/orcamentos/${id}`, novoOrcamento).subscribe({
          next: (orcamentoAtualizado: any) => {
            this._orcamentos.update((orcamentos: Budget[]) => {
              const atualizados = [...orcamentos];
              const indice = atualizados.findIndex(o => 
                o.categoria === categoria && o.mes === mes && o.ano === ano
              );
              if (indice >= 0) {
                atualizados[indice] = { ...novoOrcamento };
              }
              return atualizados;
            });
          },
          error: (error) => {
            console.error('Erro ao atualizar orçamento:', error);
          }
        });
      }
    } else {
      this.http.post(`${this.API_URL}/orcamentos`, novoOrcamento).subscribe({
        next: (orcamentoCriado: any) => {
          this._orcamentos.update((orcamentos: Budget[]) => [...orcamentos, novoOrcamento]);
        },
        error: (error) => {
          console.error('Erro ao criar orçamento:', error);
        }
      });
    }
  }

  /**
   * Remove uma despesa pelo ID
   */
  removerDespesa(id: string): void {
    this.http.delete(`${this.API_URL}/despesas/${id}`).subscribe({
      next: () => {
        this._expenses.update((despesas: Expense[]) => despesas.filter((despesa: Expense) => despesa.id !== id));
      },
      error: (error) => {
        console.error('Erro ao remover despesa:', error);
      }
    });
  }

  /**
   * Remove todas as despesas
   */
  limparTodasDespesas(): void {
    this.http.get<Expense[]>(`${this.API_URL}/despesas`).subscribe({
      next: (despesas) => {
        despesas.forEach(despesa => {
          this.http.delete(`${this.API_URL}/despesas/${despesa.id}`).subscribe();
        });
        this._expenses.set([]);
      },
      error: (error) => {
        console.error('Erro ao limpar despesas:', error);
      }
    });
  }

  /**
   * Define a categoria para filtro
   */
  definirFiltroCategoria(categoria: string): void {
    this._categoriaSelecionada.set(categoria);
  }

  /**
   * Define o ano para filtro
   */
  definirFiltroAno(ano: number | null): void {
    this._anoSelecionado.set(ano);
  }

  /**
   * Define o mês para filtro
   */
  definirFiltroMes(mes: number | null): void {
    this._mesSelecionado.set(mes);
  }

  /**
   * Obtém lista de anos disponíveis nas despesas
   */
  readonly anosDisponiveis$ = computed(() => {
    const despesas = this._expenses();
    const anos = new Set<number>();
    
    despesas.forEach((despesa: Expense) => {
      anos.add(despesa.data.getFullYear());
    });
    
    return Array.from(anos).sort((a, b) => b - a); // Ordena do mais recente para o mais antigo
  });

  /**
   * Gera um ID único para a despesa
   */
  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Carrega dados do backend
   */
  private carregarDoBackend(): void {
    // Carrega despesas
    this.http.get<any[]>(`${this.API_URL}/despesas`).subscribe({
      next: (despesas) => {
        const despesasParseadas: Expense[] = despesas.map(despesa => this.parsearDespesa(despesa));
        this._expenses.set(despesasParseadas);
      },
      error: (error) => {
        console.error('Erro ao carregar despesas do backend:', error);
        // Fallback para localStorage se o backend não estiver disponível
        this.carregarDoLocalStorage();
      }
    });

    // Carrega receitas
    this.http.get<any[]>(`${this.API_URL}/receitas`).subscribe({
      next: (receitas) => {
        const receitasParseadas: Income[] = receitas.map(receita => this.parsearReceita(receita));
        this._receitas.set(receitasParseadas);
      },
      error: (error) => {
        console.error('Erro ao carregar receitas do backend:', error);
      }
    });

    // Carrega orçamentos
    this.http.get<Budget[]>(`${this.API_URL}/orcamentos`).subscribe({
      next: (orcamentos) => {
        this._orcamentos.set(orcamentos);
      },
      error: (error) => {
        console.error('Erro ao carregar orçamentos do backend:', error);
      }
    });
  }

  /**
   * Parseia uma despesa do formato JSON para Expense
   */
  private parsearDespesa(despesa: any): Expense {
    return {
      id: despesa.id,
      descricao: despesa.descricao || '',
      valor: despesa.valor || 0,
      categoria: despesa.categoria || '',
      data: new Date(despesa.data),
      tipoPagamento: despesa.tipoPagamento || 'débito',
      tipoDespesa: despesa.tipoDespesa || 'variável',
      dataVencimento: despesa.dataVencimento ? new Date(despesa.dataVencimento) : undefined
    };
  }

  /**
   * Parseia uma receita do formato JSON para Income
   */
  private parsearReceita(receita: any): Income {
    return {
      id: receita.id,
      descricao: receita.descricao || '',
      valor: receita.valor || 0,
      data: new Date(receita.data),
      categoria: receita.categoria || 'Outros'
    };
  }

  /**
   * Fallback: Carrega do localStorage se o backend não estiver disponível
   */
  private carregarDoLocalStorage(): void {
    try {
      const armazenado = localStorage.getItem('expenses');
      if (armazenado) {
        const despesas = JSON.parse(armazenado) as Array<Omit<Expense, 'data'> & { data: string; descricao?: string; valor?: number; categoria?: string; tipoPagamento?: string; tipoDespesa?: string; dataVencimento?: string }>;
        const despesasParseadas: Expense[] = despesas.map(despesa => ({
          id: despesa.id,
          descricao: despesa.descricao || (despesa as any).description || '',
          valor: despesa.valor || (despesa as any).value || 0,
          categoria: despesa.categoria || (despesa as any).category || '',
          data: new Date(despesa.data || (despesa as any).date),
          tipoPagamento: despesa.tipoPagamento || (despesa as any).paymentType || 'débito',
          tipoDespesa: despesa.tipoDespesa || (despesa as any).expenseType || 'variável',
          dataVencimento: despesa.dataVencimento ? new Date(despesa.dataVencimento) : ((despesa as any).dueDate ? new Date((despesa as any).dueDate) : undefined)
        }));
        this._expenses.set(despesasParseadas);
      }

      const receitasArmazenadas = localStorage.getItem('incomes');
      if (receitasArmazenadas) {
        const receitas = JSON.parse(receitasArmazenadas) as Array<Omit<Income, 'data'> & { data: string; descricao?: string; valor?: number; categoria?: string }>;
        const receitasParseadas: Income[] = receitas.map(receita => ({
          id: receita.id,
          descricao: receita.descricao || (receita as any).description || '',
          valor: receita.valor || (receita as any).value || 0,
          data: new Date(receita.data || (receita as any).date),
          categoria: receita.categoria || (receita as any).category || 'Outros'
        }));
        this._receitas.set(receitasParseadas);
      }

      const orcamentosArmazenados = localStorage.getItem('budgets');
      if (orcamentosArmazenados) {
        const orcamentos = JSON.parse(orcamentosArmazenados) as Budget[];
        const orcamentosParseados: Budget[] = orcamentos.map(orcamento => ({
          categoria: (orcamento as any).categoria || (orcamento as any).category || '',
          limiteMensal: (orcamento as any).limiteMensal || (orcamento as any).monthlyLimit || 0,
          mes: (orcamento as any).mes || (orcamento as any).month || 0,
          ano: (orcamento as any).ano || (orcamento as any).year || new Date().getFullYear()
        }));
        this._orcamentos.set(orcamentosParseados);
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
  }

  /**
   * Computed signal para total de receitas
   */
  readonly totalReceitas$ = computed(() => {
    return this._receitas().reduce((total: number, receita: Income) => total + receita.valor, 0);
  });

  /**
   * Computed signal para saldo (Receitas - Despesas)
   */
  readonly saldo$ = computed(() => {
    return this.totalReceitas$() - this.totalDespesas$();
  });

  /**
   * Computed signal para dados de orçamento por categoria
   */
  readonly dadosOrcamento$ = computed(() => {
    const despesas = this.despesasFiltradasPorData$();
    const orcamentos = this._orcamentos();
    const mesSelecionado = this._mesSelecionado();
    const anoSelecionado = this._anoSelecionado();
    
    // Se não há filtro de mês, usa o mês atual
    const mesAtual = mesSelecionado !== null ? mesSelecionado : new Date().getMonth();
    // Se não há filtro de ano, usa o ano atual
    const anoAtual = anoSelecionado !== null ? anoSelecionado : new Date().getFullYear();

    const totaisPorCategoria = new Map<string, number>();
    despesas.forEach((despesa: Expense) => {
      const totalAtual = totaisPorCategoria.get(despesa.categoria) || 0;
      totaisPorCategoria.set(despesa.categoria, totalAtual + despesa.valor);
    });

    return CATEGORIAS.map(categoria => {
      const gasto = totaisPorCategoria.get(categoria) || 0;
      const orcamento = orcamentos.find(
        (orcamento: Budget) => orcamento.categoria === categoria && orcamento.mes === mesAtual && orcamento.ano === anoAtual
      );
      const limite = orcamento?.limiteMensal || 0;
      const percentual = limite > 0 ? (gasto / limite) * 100 : 0;
      const status = percentual >= 100 ? 'exceeded' : percentual >= 80 ? 'warning' : 'ok';

      return {
        categoria,
        gasto,
        limite,
        percentual,
        status
      };
    });
  });

  /**
   * Computed signal para próximos vencimentos (próximos 7 dias)
   */
  readonly proximosVencimentos$ = computed(() => {
    const despesas = this._expenses();
    const hoje = new Date();
    const proximaSemana = new Date(hoje);
    proximaSemana.setDate(hoje.getDate() + 7);

    return despesas
      .filter((despesa: Expense) => {
        if (!despesa.dataVencimento || despesa.tipoDespesa !== 'fixa') return false;
        const dataVencimento = new Date(despesa.dataVencimento);
        return dataVencimento >= hoje && dataVencimento <= proximaSemana;
      })
      .sort((a, b) => {
        const dataA = a.dataVencimento!.getTime();
        const dataB = b.dataVencimento!.getTime();
        return dataA - dataB;
      })
      .slice(0, 5); // Próximos 5 vencimentos
  });

  /**
   * Computed signal para gráfico de tendência (evolução do patrimônio)
   */
  readonly dadosTendencia$ = computed(() => {
    const despesas = this._expenses();
    const receitas = this._receitas();
    
    // Agrupa por mês/ano
    const dadosMensais = new Map<string, { receita: number; despesa: number; saldo: number }>();
    
    receitas.forEach((receita: Income) => {
      const chave = `${receita.data.getFullYear()}-${String(receita.data.getMonth() + 1).padStart(2, '0')}`;
      const nomeMes = receita.data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!dadosMensais.has(nomeMes)) {
        dadosMensais.set(nomeMes, { receita: 0, despesa: 0, saldo: 0 });
      }
      const dados = dadosMensais.get(nomeMes)!;
      dados.receita += receita.valor;
    });

    despesas.forEach((despesa: Expense) => {
      const chave = `${despesa.data.getFullYear()}-${String(despesa.data.getMonth() + 1).padStart(2, '0')}`;
      const nomeMes = despesa.data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!dadosMensais.has(nomeMes)) {
        dadosMensais.set(nomeMes, { receita: 0, despesa: 0, saldo: 0 });
      }
      const dados = dadosMensais.get(nomeMes)!;
      dados.despesa += despesa.valor;
    });

    // Calcula saldo acumulado
    let saldoAcumulado = 0;
    return Array.from(dadosMensais.entries())
      .map(([mes, dados]) => {
        saldoAcumulado += dados.receita - dados.despesa;
        return {
          mes,
          receita: dados.receita,
          despesa: dados.despesa,
          saldo: saldoAcumulado
        };
      })
      .sort((a, b) => {
        // Ordena por data
        const dataA = new Date(a.mes);
        const dataB = new Date(b.mes);
        return dataA.getTime() - dataB.getTime();
      })
      .slice(-12); // Últimos 12 meses
  });
}
