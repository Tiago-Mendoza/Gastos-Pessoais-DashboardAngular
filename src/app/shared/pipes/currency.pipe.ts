import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe simples para formatação de moeda brasileira
 * 
 * Exemplo de uso: {{ value | brlCurrency }}
 */
@Pipe({
  name: 'brlCurrency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null || isNaN(value)) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
