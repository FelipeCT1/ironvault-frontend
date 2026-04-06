import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { CarrinhoService } from '../../../core/services/carrinho.service';
import { ItemCarrinho } from '../../../models/carrinho.model';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page-wrapper" style="max-width: 960px">
      <div class="page-header">
        <div>
          <div class="page-header__rotulo">RF0031 – RF0032</div>
          <h1 class="page-header__titulo">Carrinho</h1>
          <p class="page-header__sub">
            {{ itens().length }} item(ns) · Total: {{ totais().subtotal | currency:'BRL' }}
          </p>
        </div>
        <div class="page-header__actions">
          <a routerLink="/produtos" class="btn btn--ghost">← Continuar comprando</a>
        </div>
      </div>

      @if (!temItens()) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-state__icon">🛒</div>
            <div class="empty-state__title">Seu carrinho está vazio</div>
            <div class="empty-state__sub">Adicione produtos ao carrinho para continuar.</div>
            <a routerLink="/produtos" class="btn btn--primary" style="margin-top: 16px">
              Ver Produtos
            </a>
          </div>
        </div>
      }

      @if (temItens()) {
        <div class="grid-2" style="gap: 24px; align-items: start">
          <!-- Lista de itens -->
          <div class="card">
            <div class="card__header">
              <span class="card__titulo">Itens do Carrinho</span>
            </div>

            @for (item of itens(); track item.produto.id) {
              <div class="item-carrinho">
                <div class="item-carrinho__img">
                  <img [src]="item.produto.imagemUrl" [alt]="item.produto.nome" />
                </div>
                <div class="item-carrinho__info">
                  <span class="item-carrinho__marca">{{ item.produto.marca }}</span>
                  <h4 class="item-carrinho__nome">{{ item.produto.nome }}</h4>
                  <span class="item-carrinho__preco">
                    {{ item.precoUnitario | currency:'BRL' }}
                  </span>
                </div>
                <div class="item-carrinho__qtd">
                  <button
                    (click)="diminuirQuantidade(item)"
                    class="btn-qtd"
                    [disabled]="item.quantidade <= 1">
                    −
                  </button>
                  <span>{{ item.quantidade }}</span>
                  <button
                    (click)="aumentarQuantidade(item)"
                    class="btn-qtd"
                    [disabled]="item.quantidade >= item.produto.estoque">
                    +
                  </button>
                </div>
                <div class="item-carrinho__total">
                  {{ (item.precoUnitario * item.quantidade) | currency:'BRL' }}
                </div>
                <button (click)="removerItem(item)" class="btn btn--danger btn--sm">
                  ✕
                </button>
              </div>
            }

            <div style="padding-top: 16px; border-top: 1px solid var(--borda); margin-top: 16px">
              <button (click)="limparCarrinho()" class="btn btn--ghost btn--sm">
                🗑️ Limpar carrinho
              </button>
            </div>
          </div>

          <!-- Resumo -->
          <div class="card" style="position: sticky; top: 80px">
            <div class="card__header">
              <span class="card__titulo">Resumo</span>
            </div>

            <div class="resumo-linha">
              <span>Subtotal ({{ itens().length }} itens)</span>
              <span>{{ totais().subtotal | currency:'BRL' }}</span>
            </div>

            @if (totais().descontoPromocional > 0) {
              <div class="resumo-linha resumo-linha--desconto">
                <span>Cupom promocional</span>
                <span>-{{ totais().descontoPromocional | currency:'BRL' }}</span>
              </div>
            }

            <div class="resumo-linha">
              <span>Frete</span>
              <span>Calcular no checkout</span>
            </div>

            <div class="resumo-total">
              <span>Total</span>
              <span>{{ totais().total | currency:'BRL' }}</span>
            </div>

            <a routerLink="/checkout" class="btn btn--primary btn--full btn--lg" style="margin-top: 16px">
              Continuar para Checkout →
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .item-carrinho {
      display: grid;
      grid-template-columns: 80px 1fr auto auto auto auto;
      gap: 16px;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--borda);
    }

    .item-carrinho:last-of-type {
      border-bottom: none;
    }

    .item-carrinho__img {
      width: 80px;
      height: 80px;
      background: var(--painel);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .item-carrinho__img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .item-carrinho__marca {
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--acento);
    }

    .item-carrinho__nome {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: .9rem;
      font-weight: 700;
      margin: 4px 0;
    }

    .item-carrinho__preco {
      font-size: .82rem;
      color: var(--mudo);
    }

    .item-carrinho__qtd {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--painel);
      border: 1px solid var(--borda);
      border-radius: 4px;
      padding: 4px 8px;
    }

    .btn-qtd {
      background: none;
      border: none;
      color: var(--claro);
      font-size: 1rem;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-qtd:hover:not(:disabled) {
      color: var(--acento);
    }

    .btn-qtd:disabled {
      opacity: .3;
      cursor: not-allowed;
    }

    .item-carrinho__total {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 1rem;
      min-width: 80px;
      text-align: right;
    }

    .resumo-linha {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: .85rem;
      color: var(--claro);
    }

    .resumo-linha--desconto {
      color: var(--verde);
    }

    .resumo-total {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      margin-top: 8px;
      border-top: 1px solid var(--borda);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 1.3rem;
    }

    @media (max-width: 768px) {
      .item-carrinho {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .item-carrinho__img {
        width: 100%;
        height: 120px;
      }
    }
  `]
})
export class CarrinhoComponent implements OnInit {
  private readonly carrinhoService = inject(CarrinhoService);

  itens = this.carrinhoService.itens;
  temItens = this.carrinhoService.temItens;
  totais = this.carrinhoService.totais;

  ngOnInit(): void {
    // Carrega carrinho do localStorage se existir
    this.carrinhoService.carregarDoStorage();
  }

  aumentarQuantidade(item: ItemCarrinho): void {
    this.carrinhoService.alterarQuantidade(item.produto.id, item.quantidade + 1);
  }

  diminuirQuantidade(item: ItemCarrinho): void {
    this.carrinhoService.alterarQuantidade(item.produto.id, item.quantidade - 1);
  }

  removerItem(item: ItemCarrinho): void {
    this.carrinhoService.removerItem(item.produto.id);
  }

  limparCarrinho(): void {
    this.carrinhoService.limpar();
  }
}
