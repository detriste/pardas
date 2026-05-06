import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  mensagem: string;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private nomeUsuarioKey = 'nomeUsuario';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(res => {
        // Salva o nome retornado pelo backend
        sessionStorage.setItem(this.nomeUsuarioKey, res.nome);
      })
    );
  }

  getNome(): string {
    return sessionStorage.getItem(this.nomeUsuarioKey) ?? 'Usuário';
  }

  logout(): void {
    sessionStorage.removeItem(this.nomeUsuarioKey);
  }

  isLogado(): boolean {
    return !!sessionStorage.getItem(this.nomeUsuarioKey);
  }
}