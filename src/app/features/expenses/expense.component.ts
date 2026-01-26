import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { CATEGORIAS } from '../../models/expense.model';
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

  despesas$ = this.expenseService.despesasFiltradas$;
  todasDespesas$ = this.expenseService.expenses$;
  totalDespesas$ = this.expenseService.totalDespesas$;
  categoriaSelecionada$ = this.expenseService.categoriaSelecionada$;
  
  mostrarModal = signal(false);

  categorias = ['Todas', ...CATEGORIAS];
  readonly CATEGORIAS = CATEGORIAS;

  descricao = '';
  valor = 0;
  categoriaSelecionada = CATEGORIAS[0];
  tipoPagamento: 'débito' | 'crédito' | 'pix' = 'débito';
  tipoDespesa: 'fixa' | 'variável' = 'variável';
  dataVencimento: string = '';
  mesDespesa: string = this.obterMesAnoAtual();

  private obterMesAnoAtual(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
  }

  private readonly emojisCategoria: { [key: string]: string } = {
    'Alimentação': '🍔',
    'Transporte': '🚗',
    'Lazer': '🎮',
    'Saúde': '💊',
    'Educação': '📚',
    'Moradia': '🏠',
    'Outros': '📦'
  };

  selecionarDebitoPix(): void {
    if (this.tipoPagamento === 'débito') {
      this.tipoPagamento = 'pix';
    } else {
      this.tipoPagamento = 'débito';
    }
  }

  adicionarDespesa(): void {
    if (!this.descricao.trim() || this.valor <= 0) {
      return;
    }

    const dataVencimentoObj = this.tipoDespesa === 'fixa' && this.dataVencimento ? new Date(this.dataVencimento) : undefined;
    
    // Cria uma data a partir do mês/ano selecionado (primeiro dia do mês)
    let dataDespesaObj: Date | undefined = undefined;
    if (this.mesDespesa) {
      const [ano, mes] = this.mesDespesa.split('-').map(Number);
      dataDespesaObj = new Date(ano, mes - 1, 1); // mês - 1 porque Date usa 0-11
    }

    this.expenseService.adicionarDespesa(
      this.descricao.trim(),
      this.valor,
      this.categoriaSelecionada,
      this.tipoPagamento,
      this.tipoDespesa,
      dataVencimentoObj,
      dataDespesaObj
    );

    this.descricao = '';
    this.valor = 0;
    this.categoriaSelecionada = CATEGORIAS[0];
    this.tipoPagamento = 'débito';
    this.tipoDespesa = 'variável';
    this.dataVencimento = '';
    this.mesDespesa = this.obterMesAnoAtual();
  }

  removerDespesa(id: string): void {
    this.expenseService.removerDespesa(id);
  }

  limparTodas(): void {
    if (confirm('Tem certeza que deseja remover todas as despesas?')) {
      this.expenseService.limparTodasDespesas();
    }
  }

  aoMudarCategoria(categoria: string): void {
    this.expenseService.definirFiltroCategoria(categoria);
  }

  ehAltoValor(valor: number): boolean {
    return valor > 500;
  }

  obterEmojiCategoria(categoria: string): string {
    return this.emojisCategoria[categoria] || '📦';
  }

  abrirModal(): void {
    this.mostrarModal.set(true);
  }

  fecharModal(): void {
    this.mostrarModal.set(false);
  }
}
