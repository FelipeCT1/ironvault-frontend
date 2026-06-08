import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { OrderSummaryComponent } from '../../../shared/components/order-summary/order-summary';
import { ModalComponent } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, EmptyStateComponent, OrderSummaryComponent, ModalComponent],
  template: `
    <div class="page-wrapper" style="padding-top: 32px;">
      <div class="page-header">
        <div>
          <div class="page-header-label">Vendas</div>
          <h1>Carrinho</h1>
        </div>
        <button class="btn btn-sm btn-danger" (click)="confirmarLimpar()">Limpar Carrinho</button>
      </div>

      @if (!carrinho.temItens()) {
        <app-empty-state icone="🛒" titulo="Seu carrinho está vazio" sub="Adicione produtos do catálogo para começar">
          <a routerLink="/produtos" class="btn btn-accent btn-sm">Ver Produtos</a>
        </app-empty-state>
      } @else {
        <div class="cart-grid">
          <div class="cart-items">
            @for (item of carrinho.itens(); track item.produto.id) {
              <div class="card cart-item">
                <div class="cart-item-img">
                  💊
                </div>
                <div class="cart-item-info">
                  <strong>{{ item.produto.nome }}</strong>
                  <p class="cart-item-marca">{{ item.produto.marca }}</p>
                </div>
                <div class="cart-item-qty">
                  <button class="btn btn-sm btn-icon" (click)="carrinho.alterarQuantidade(item.produto.id, item.quantidade - 1)">-</button>
                  <span class="cart-item-qty-valor">{{ item.quantidade }}</span>
                  <button class="btn btn-sm btn-icon" (click)="carrinho.alterarQuantidade(item.produto.id, item.quantidade + 1)">+</button>
                </div>
                <span class="cart-item-preco">
                  {{ item.precoUnitario * item.quantidade | currency:'BRL':'symbol':'1.2-2' }}
                </span>
                <button class="btn btn-sm btn-danger" (click)="carrinho.removerItem(item.produto.id)">Remover</button>
              </div>
            }
          </div>

          <div class="cart-sidebar">
            <app-order-summary [totais]="carrinho.totais()" />
            <a routerLink="/checkout" class="btn btn-accent cart-checkout-btn">
              Continuar para Checkout
            </a>
          </div>
        </div>
      }
    </div>

    <app-modal [aberto]="modalAberto()" [mostrarFooter]="true" titulo="Limpar Carrinho" (fechar)="modalAberto.set(false)">
      <p>Tem certeza que deseja limpar todos os itens do carrinho?</p>
      <div modal-footer>
        <button class="btn btn-outline" (click)="modalAberto.set(false)">Cancelar</button>
        <button class="btn btn-danger" (click)="limpar()">Confirmar</button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarrinhoComponent {
  protected readonly carrinho = inject(CarrinhoService);
  protected modalAberto = signal(false);

  confirmarLimpar() {
    this.modalAberto.set(true);
  }

  limpar() {
    this.carrinho.limpar();
    this.modalAberto.set(false);
  }
}
