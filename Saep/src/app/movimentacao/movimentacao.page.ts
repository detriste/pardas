import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProdutoService, Produto } from '../services/produto';
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

  // lista original para o formulário de nova movimentação
  private todosProdutos: ProdutoView[] = [];

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

  async carregarDados() {
    const loading = await this.loadingCtrl.create({ message: 'Carregando...' });
    await loading.present();

    // Carrega produtos
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

    // Carrega histórico
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

  // Bubble Sort por nome do produto
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

  async novaMovimentacao() {
    if (this.todosProdutos.length === 0) {
      this.mostrarToast('Nenhum produto cadastrado.', 'warning');
      return;
    }

    // Monta as opções do select com os produtos
    const opcoesProdutos = this.todosProdutos
      .map(p => ({ label: `${p.nome} (estoque: ${p.estoque})`, value: String(p.id) }));

    const alert = await this.alertCtrl.create({
      header: 'Nova Movimentação',
      inputs: [
        {
          name: 'produto_id',
          type: 'number',
          placeholder: `ID do produto (1 a ${this.todosProdutos.length})`,
        },
        {
          name: 'tipo',
          type: 'text',
          placeholder: 'Tipo: Entrada ou Saida',
        },
        {
          name: 'quantidade',
          type: 'number',
          placeholder: 'Quantidade',
        },
      ],
      message: `<small><b>Produtos disponíveis:</b><br>${opcoesProdutos.map(o => `• [${o.value}] ${o.label}`).join('<br>')}</small>`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: (dados) => {
            const id = parseInt(dados.produto_id, 10);
            const tipo = dados.tipo?.trim();
            const qtd = parseInt(dados.quantidade, 10);

            if (!id || !tipo || !qtd) {
              this.mostrarToast('Preencha todos os campos.', 'warning');
              return false;
            }

            if (tipo !== 'Entrada' && tipo !== 'Saida') {
              this.mostrarToast('Tipo deve ser "Entrada" ou "Saida".', 'warning');
              return false;
            }

            this.registrar({ produto_id: id, tipo: tipo as 'Entrada' | 'Saida', quantidade: qtd });
            return true;
          },
        },
      ],
    });
    await alert.present();
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