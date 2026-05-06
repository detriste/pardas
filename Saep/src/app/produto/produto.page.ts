import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProdutoService, Produto } from '../services/produto.service';
import { AuthService } from '../services/auth.service';

// Modelo local mapeado do backend
interface ProdutoView {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  estoqueMin: number;
}

@Component({
  selector: 'app-produto',
  templateUrl: './produto.page.html',
  styleUrls: ['./produto.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ProdutoPage implements OnInit {
  termoBusca: string = '';
  nomeUsuario: string = 'Usuário';

  produtos: ProdutoView[] = [];
  produtosFiltrados: ProdutoView[] = [];

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private produtoService: ProdutoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.authService.getNome();
    this.carregarProdutos();
  }

  // Converte do formato do backend para o formato da view
  private mapear(p: Produto): ProdutoView {
    return {
      id: p.id,
      nome: p.nomepro,
      descricao: p.desc,
      preco: Number(p.preco),
      estoque: p.quantidade,
      estoqueMin: Number(p.quantidade_minima),
    };
  }

  async carregarProdutos() {
    const loading = await this.loadingCtrl.create({ message: 'Carregando...' });
    await loading.present();

    this.produtoService.listar().subscribe({
      next: async (data) => {
        await loading.dismiss();
        this.produtos = data.map(p => this.mapear(p));
        this.filtrarProdutos();
      },
      error: async () => {
        await loading.dismiss();
        this.mostrarToast('Erro ao carregar produtos.', 'danger');
      },
    });
  }

  filtrarProdutos() {
    const termo = this.termoBusca.toLowerCase().trim();
    this.produtosFiltrados = termo
      ? this.produtos.filter(p => p.nome.toLowerCase().includes(termo))
      : [...this.produtos];
  }

  novoProduto() {
    this.abrirFormulario();
  }

  editarProduto(produto: ProdutoView) {
    this.abrirFormulario(produto);
  }

  async abrirFormulario(produto?: ProdutoView) {
    const isEdicao = !!produto;
    const alert = await this.alertCtrl.create({
      header: isEdicao ? 'Editar Produto' : 'Novo Produto',
      inputs: [
        { name: 'nomepro',          type: 'text',   placeholder: 'Nome',           value: produto?.nome ?? '' },
        { name: 'desc',             type: 'text',   placeholder: 'Descrição',      value: produto?.descricao ?? '' },
        { name: 'preco',            type: 'number', placeholder: 'Preço (R$)',     value: produto?.preco ?? '' },
        { name: 'quantidade',       type: 'number', placeholder: 'Estoque',        value: produto?.estoque ?? '' },
        { name: 'quantidade_minima',type: 'number', placeholder: 'Estoque mínimo', value: produto?.estoqueMin ?? '' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: isEdicao ? 'Salvar' : 'Cadastrar',
          handler: (dados) => {
            if (!dados.nomepro || !dados.desc || !dados.preco || !dados.quantidade || !dados.quantidade_minima) {
              this.mostrarToast('Preencha todos os campos.', 'warning');
              return false;
            }
            const payload = {
              nomepro: dados.nomepro,
              desc: dados.desc,
              preco: parseFloat(dados.preco),
              quantidade: parseInt(dados.quantidade, 10),
              quantidade_minima: parseInt(dados.quantidade_minima, 10),
            };
            if (isEdicao) {
              this.salvarEdicao(produto!.id, payload);
            } else {
              this.salvarNovo(payload);
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private salvarNovo(payload: any) {
    this.produtoService.cadastrar(payload).subscribe({
      next: () => {
        this.mostrarToast('Produto cadastrado!', 'success');
        this.carregarProdutos();
      },
      error: () => this.mostrarToast('Erro ao cadastrar produto.', 'danger'),
    });
  }

  private salvarEdicao(id: number, payload: any) {
    this.produtoService.editar(id, payload).subscribe({
      next: () => {
        this.mostrarToast('Produto atualizado!', 'success');
        this.carregarProdutos();
      },
      error: () => this.mostrarToast('Erro ao atualizar produto.', 'danger'),
    });
  }

  async excluirProduto(produto: ProdutoView) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar exclusão',
      message: `Deseja excluir "${produto.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.produtoService.excluir(produto.id).subscribe({
              next: () => {
                this.mostrarToast('Produto excluído!', 'success');
                this.carregarProdutos();
              },
              error: () => this.mostrarToast('Erro ao excluir produto.', 'danger'),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  voltar() {
    this.router.navigate(['/movimentacao']);
  }

  private async mostrarToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}