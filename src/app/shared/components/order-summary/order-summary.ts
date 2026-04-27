import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { CarrinhoTotais } from '../../../core/models/carrinho.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="card">
      <h3 class="card-titulo">{{ titulo() }}</h3>
      <div class="subtotal" style="display: flex; justify-content: space-between;">
        <span>Subtotal</span>
        <span class="prod-preco">{{ totais().subtotal | currency:'BRL':'symbol':'1.2-2' }}</span>
      </div>
      @if (totais().descontoPromocional > 0) {
        <div class="subtotal" style="display: flex; justify-content: space-between;">
          <span>Desconto Promocional</span>
          <span class="prod-preco">-{{ totais().descontoPromocional | currency:'BRL':'symbol':'1.2-2' }}</span>
        </div>
      }
      @if (totais().descontoTroca > 0) {
        <div class="subtotal" style="display: flex; justify-content: space-between;">
          <span>Desconto Troca</span>
          <span class="prod-preco">-{{ totais().descontoTroca | currency:'BRL':'symbol':'1.2-2' }}</span>
        </div>
      }
      @if (mostrarFrete() && totais().valorFrete > 0) {
        <div class="subtotal" style="display: flex; justify-content: space-between;">
          <span>Frete {{ freteNome() }}</span>
          <span class="prod-preco">{{ totais().valorFrete | currency:'BRL':'symbol':'1.2-2' }}</span>
        </div>
      }
      <div class="subtotal" style="border-top: 1px solid var(--borda); padding-top: 12px; display: flex; justify-content: space-between;">
        <strong>Total</strong>
        <strong class="prod-preco">{{ totais().totalAPagar | currency:'BRL':'symbol':'1.2-2' }}</strong>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummaryComponent {
  readonly titulo = input('Resumo do Pedido');
  readonly totais = input.required<CarrinhoTotais>();
  readonly freteNome = input('');
  readonly mostrarFrete = input(false);
}
