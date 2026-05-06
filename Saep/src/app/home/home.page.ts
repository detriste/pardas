import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async entrar() {
    if (!this.email || !this.senha) {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Preencha e-mail e senha.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Entrando...' });
    await loading.present();

    this.authService.login(this.email, this.senha).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigate(['/produto']);
      },
      error: async (err: any) => {
        await loading.dismiss();
        const msg =
          err.status === 401
            ? 'E-mail ou senha inválidos.'
            : 'Erro ao conectar com o servidor.';
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: msg,
          buttons: ['OK'],
        });
        await alert.present();
      },
    });
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }
}