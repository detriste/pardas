import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovimentacaoPage } from './movimentacao.page';

const routes: Routes = [
  { path: '', component: MovimentacaoPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MovimentacaoPageRoutingModule {}