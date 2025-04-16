import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { Observable, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, InputNumberModule, FormsModule],
  template: `
    <div class="cart-sidebar">
      <h2>Votre Panier</h2>

      <div *ngIf="(isEmpty$ | async)" class="empty-cart">
        <p>Votre panier est vide</p>
        <button pButton label="Continuer vos achats" icon="pi pi-arrow-left" (click)="closeCart()"></button>
      </div>

      <div *ngIf="!(isEmpty$ | async)">
        <p-table [value]="(cartItems$ | async) || []" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Total</th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.product.name }}</td>
              <td>{{ item.product.price | currency:'EUR' }}</td>
              <td>
                <p-inputNumber
                  [(ngModel)]="item.quantity"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  [min]="1"
                  [max]="10"
                  (onInput)="updateQuantity(item.product.id, item.quantity)"
                  decrementButtonClass="p-button-danger"
                  incrementButtonClass="p-button-success"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus">
                </p-inputNumber>
              </td>
              <td>{{ item.product.price * item.quantity | currency:'EUR' }}</td>
              <td>
                <button
                  pButton
                  icon="pi pi-trash"
                  class="p-button-danger p-button-sm"
                  (click)="removeItem(item.product.id)">
                </button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="footer">
            <tr>
              <td colspan="3" class="text-right font-bold">Total:</td>
              <td colspan="2" class="font-bold">{{ totalPrice$ | async | currency:'EUR' }}</td>
            </tr>
          </ng-template>
        </p-table>

        <div class="cart-actions">
          <button pButton label="Vider le panier" icon="pi pi-trash" class="p-button-outlined p-button-danger" (click)="clearCart()"></button>
          <button pButton label="Commander" icon="pi pi-check" class="p-button-success"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-sidebar {
      padding: 1rem;
    }
    .empty-cart {
      text-align: center;
      margin: 2rem 0;
    }
    .cart-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
    }
    .text-right {
      text-align: right;
    }
    .font-bold {
      font-weight: bold;
    }
  `]
})
export class CartSidebarComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  cartItems$: Observable<CartItem[]>;
  totalPrice$: Observable<number>;
  isEmpty$: Observable<boolean>;

  constructor(private cartService: CartService) {
    this.cartItems$ = this.cartService.getCartItems();
    this.totalPrice$ = this.cartService.getTotalPrice();
    this.isEmpty$ = this.cartItems$.pipe(
      map(items => items.length === 0)
    );
  }

  ngOnInit(): void {}

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  closeCart(): void {
    this.close.emit();
  }
}
