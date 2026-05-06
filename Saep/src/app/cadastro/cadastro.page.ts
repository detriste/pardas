import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class CadastroPage {
  nome: string = '';
  email: string = '';
  senha: string = '';

  private apiUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async cadastrar() {
    if (!this.nome || !this.email || !this.senha) {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Preencha todos os campos.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Cadastrando...' });
    await loading.present();

    this.http
      .post<any>(`${this.apiUrl}/usuarios`, {
        nome: this.nome,
        email: this.email,
        senha: this.senha,
      })
      .subscribe({
        next: async () => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Sucesso',
            message: 'Conta criada com sucesso! Faça login para continuar.',
            buttons: [
              {
                text: 'OK',
                handler: () => this.router.navigate(['/home']),
              },
            ],
          });
          await alert.present();
        },
        error: async (err: any) => {
          await loading.dismiss();
          const msg =
            err.status === 409
              ? 'Este e-mail já está cadastrado.'
              : 'Erro ao cadastrar. Tente novamente.';
          const alert = await this.alertCtrl.create({
            header: 'Erro',
            message: msg,
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
  }

  irParaLogin() {
    this.router.navigate(['/home']);
  }
}