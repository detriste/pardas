import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../services/produto';
import { MovimentacaoService, Movimentacao } from '../services/movimentacao';
import { AuthService } from '../services/auth';

interface ProdutoView {
  id: number;
  nome: string;
  estoque: number;
  estoqueMin: number;
}

@Component({
  selector: 'app-movimentacao',
  templateUrl: './movimentacao.page.html',
  styleUrls: ['./movimentacao.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class MovimentacaoPage implements OnInit {
  nomeUsuario: string = 'Usuário';
  produtosOrdenados: ProdutoView[] = [];
  produtosAbaixoMinimo: ProdutoView[] = [];
  historico: Movimentacao[] = [];
  todosProdutos: ProdutoView[] = [];

  modalAberto: boolean = false;
  formProdutoId: string = '';
  formTipo: string = '';
  formQuantidade: number | null = null;
  formData: string = '';

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private produtoService: ProdutoService,
    private movimentacaoService: MovimentacaoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.authService.getNome();
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  async carregarDados() {
    const loading = await this.loadingCtrl.create({ message: 'Carregando...' });
    await loading.present();

    this.produtoService.listar().subscribe({
      next: (data: any[]) => {
        const produtos: ProdutoView[] = data.map((p: any) => ({
          id: p.id,
          nome: p.nomepro,
          estoque: p.quantidade,
          estoqueMin: Number(p.quantidade_minima),
        }));
        this.todosProdutos = produtos;
        this.produtosOrdenados = this.bubbleSort([...produtos]);
        this.produtosAbaixoMinimo = produtos.filter(p => p.estoque <= p.estoqueMin);
      },
      error: () => this.mostrarToast('Erro ao carregar produtos.', 'danger'),
    });

    this.movimentacaoService.listar().subscribe({
      next: async (data) => {
        await loading.dismiss();
        this.historico = data;
      },
      error: async () => {
        await loading.dismiss();
        this.mostrarToast('Erro ao carregar histórico.', 'danger');
      },
    });
  }

  private bubbleSort(arr: ProdutoView[]): ProdutoView[] {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j].nome.toLowerCase() > arr[j + 1].nome.toLowerCase()) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }

  novaMovimentacao() {
    if (this.todosProdutos.length === 0) {
      this.mostrarToast('Nenhum produto cadastrado.', 'warning');
      return;
    }
    const hoje = new Date().toISOString().split('T')[0];
    this.formProdutoId = '';
    this.formTipo = '';
    this.formQuantidade = null;
    this.formData = hoje;
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  confirmarMovimentacao() {
    const id = parseInt(this.formProdutoId, 10);
    const qtd = Number(this.formQuantidade);

    if (!id || !this.formTipo || !qtd || !this.formData) {
      this.mostrarToast('Preencha todos os campos.', 'warning');
      return;
    }

    this.registrar({
      produto_id: id,
      tipo: this.formTipo as 'Entrada' | 'Saida',
      quantidade: qtd,
    });

    this.fecharModal();
  }

  private registrar(payload: { produto_id: number; tipo: 'Entrada' | 'Saida'; quantidade: number }) {
    this.movimentacaoService.registrar(payload).subscribe({
      next: () => {
        this.mostrarToast('Movimentação registrada!', 'success');
        this.carregarDados();
      },
      error: (err: any) => {
        const msg = err?.error?.erro ?? 'Erro ao registrar movimentação.';
        this.mostrarToast(msg, 'danger');
      },
    });
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  voltar() {
    this.router.navigate(['/produto']);
  }

  private async mostrarToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}