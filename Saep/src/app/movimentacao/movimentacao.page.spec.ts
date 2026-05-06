import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovimentacaoPage } from './movimentacao.page';

describe('MovimentacaoPage', () => {
  let component: MovimentacaoPage;
  let fixture: ComponentFixture<MovimentacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimentacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
