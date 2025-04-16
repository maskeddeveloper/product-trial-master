import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../services/cart.service';
import { Observable, map } from 'rxjs';
import { SidebarModule } from 'primeng/sidebar';
import { CartSidebarComponent } from '../cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-cart-badge',
  standalone: true,
  imports: [CommonModule, BadgeModule, ButtonModule, SidebarModule, CartSidebarComponent],
  template: `
    <div class="cart-container">
      <div class="cart-button-wrapper">
        <button
          pButton
          type="button"
          icon="pi pi-shopping-cart"
          class="p-button-rounded"
          (click)="toggleCartSidebar()"
        ></button>
        <span *ngIf="hasItems$ | async" class="cart-badge">{{ itemCount$ | async }}</span>
      </div>

      <p-sidebar [(visible)]="displayCart" position="right" [style]="{width:'40em', maxWidth:'90vw'}">
        <app-cart-sidebar (close)="displayCart = false"></app-cart-sidebar>
      </p-sidebar>
    </div>
  `,
  styles: [`
    .cart-container {
      display: inline-block;
    }
    .cart-button-wrapper {
      position: relative;
      display: inline-block;
    }
    .cart-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #f44336;
      color: white;
      border-radius: 50%;
      padding: 0.2rem 0.5rem;
      font-size: 0.8rem;
      min-width: 1.2rem;
      height: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CartBadgeComponent implements OnInit {
  itemCount$: Observable<number>;
  hasItems$: Observable<boolean>;
  displayCart = false;

  constructor(private cartService: CartService) {
    this.itemCount$ = this.cartService.getCartItemsCount();
    this.hasItems$ = this.itemCount$.pipe(
      map(count => count > 0)
    );
  }

  ngOnInit(): void {}

  toggleCartSidebar(): void {
    this.displayCart = !this.displayCart;
  }
}
