import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Produto {
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
  imports: [IonicModule, FormsModule, CommonModule],
})
export class ProdutoPage implements OnInit { // ✅ Nome corrigido
  termoBusca: string = '';

  produtos: Produto[] = [ // ✅ plural padronizado
    { id: 3, nome: 'Borracha Branca', descricao: 'Borracha macia escolar', preco: 1.50, estoque: 200, estoqueMin: 30 },
    { id: 2, nome: 'Caderno Universitário', descricao: 'Caderno 200 folhas capa dura', preco: 25.90, estoque: 80, estoqueMin: 10 },
    { id: 1, nome: 'Caneta Esferográfica', descricao: 'Caneta azul ponta fina', preco: 2.50, estoque: 150, estoqueMin: 20 },
    { id: 5, nome: 'Mochila Escolar', descricao: 'Mochila resistente 30L', preco: 89.90, estoque: 15, estoqueMin: 5 },
    { id: 6, nome: 'Notebook', descricao: 'Equipamento novo', preco: 500.00, estoque: 4, estoqueMin: 5 },
  ];

  produtosFiltrados: Produto[] = []; // ✅ nome corrigido

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.produtosFiltrados = [...this.produtos];
  }

  filtrarProdutos() { // ✅ nome corrigido
    const termo = this.termoBusca.toLowerCase().trim();
    this.produtosFiltrados = termo
      ? this.produtos.filter(p => p.nome.toLowerCase().includes(termo))
      : [...this.produtos];
  }

  novoProduto() {
    this.router.navigate(['/produto-form']);
  }

  editarProduto(produto: Produto) {
    this.router.navigate(['/produto-form', produto.id]);
  }

  async excluirProduto(produto: Produto) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar exclusão',
      message: `Deseja excluir o produto "${produto.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.produtos = this.produtos.filter(p => p.id !== produto.id);
            this.filtrarProdutos(); // ✅ nome corrigido
          },
        },
      ],
    });
    await alert.present();
  }

  sair() {
    this.router.navigate(['/home']);
  }

  voltar() {
    window.history.back(); // ✅ corrigido (router.back não existe)
  }
}