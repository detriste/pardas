import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Produto {
  id: number;
  nomepro: string;
  desc: string;
  preco: number;
  quantidade: number;
  quantidade_minima: number;
}

export interface ProdutoPayload {
  nomepro: string;
  desc: string;
  preco: number;
  quantidade: number;
  quantidade_minima: number;
}

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/produtos`);
  }

  cadastrar(payload: ProdutoPayload): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.apiUrl}/produtos`, payload);
  }

  editar(id: number, payload: ProdutoPayload): Observable<{ mensagem: string }> {
    return this.http.put<{ mensagem: string }>(`${this.apiUrl}/produtos/${id}`, payload);
  }

  excluir(id: number): Observable<{ mensagem: string }> {
    return this.http.delete<{ mensagem: string }>(`${this.apiUrl}/produtos/${id}`);
  }
}