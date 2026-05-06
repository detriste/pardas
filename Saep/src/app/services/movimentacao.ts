import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movimentacao {
  id: number;
  produto: string;
  tipo: 'Entrada' | 'Saida';
  quantidade: number;
  data: string;
}

export interface MovimentacaoPayload {
  produto_id: number;
  tipo: 'Entrada' | 'Saida';
  quantidade: number;
}

@Injectable({ providedIn: 'root' })
export class MovimentacaoService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listar(): Observable<Movimentacao[]> {
    return this.http.get<Movimentacao[]>(`${this.apiUrl}/movimentacoes`);
  }

  registrar(payload: MovimentacaoPayload): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.apiUrl}/movimentacoes`, payload);
  }
}