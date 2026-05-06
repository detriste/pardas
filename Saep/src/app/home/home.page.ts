import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  
})
export class HomePage {
  email: string = '';
  senha: string = '';

  constructor(private router: Router) {}

  entrar() {
    if (!this.email || !this.senha) {
      // Exibir alerta de campos obrigatórios
      return;
    }

    // Lógica de autenticação
    // Ex: this.authService.home(this.email, this.senha)
    this.router.navigate(['/produtos']);
  }
}