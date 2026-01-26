import { Routes } from '@angular/router';
import { ExpenseComponent } from './features/expenses/expense.component';

/**
 * Configuração de rotas da aplicação
 * Usando standalone components, não precisa de NgModule
 */
export const routes: Routes = [
  {
    path: '',
    component: ExpenseComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
