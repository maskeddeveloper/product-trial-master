import { Component, OnInit, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from "app/products/data-access/product.model";
import { ProductsService } from "app/products/data-access/products.service";
import { ProductFormComponent } from "app/products/ui/product-form/product-form.component";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartService } from '../../../shared/services/cart.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

const emptyProduct: Product = {
  id: 0,
  code: "",
  name: "",
  description: "",
  image: "",
  category: "",
  price: 0,
  quantity: 0,
  internalReference: "",
  shellId: 0,
  inventoryStatus: "INSTOCK",
  rating: 0,
  createdAt: 0,
  updatedAt: 0,
};

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ProductFormComponent,
    ToastModule
  ],
  providers: [MessageService]
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  public readonly products = this.productsService.products;
  public filteredProducts: Product[] = [];

  // Pagination
  public first = 0;
  public rows = 10;
  public totalRecords = 0;

  // Filtering
  public filterText = '';
  public selectedCategory: string | null = null;
  public categories: any[] = [];

  // Sorting
  public sortOptions = [
    { label: 'Prix croissant', value: 'price' },
    { label: 'Prix décroissant', value: '-price' },
    { label: 'Nom A-Z', value: 'name' },
    { label: 'Nom Z-A', value: '-name' }
  ];
  public sortField = '';

  // Product quantities
  public productQuantities: {[key: number]: number} = {};

  public isDialogVisible = false;
  public isCreation = false;
  public readonly editedProduct = signal<Product>(emptyProduct);

  ngOnInit() {
    this.productsService.get().subscribe(products => {
      // Extract unique categories
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      this.categories = uniqueCategories.map(cat => ({ label: cat, value: cat }));

      // Initialize product quantities
      products.forEach(p => {
        this.productQuantities[p.id] = 1;
      });

      this.totalRecords = products.length;
      this.applyFilters();
    });
  }

  public onCreate() {
    this.isCreation = true;
    this.isDialogVisible = true;
    this.editedProduct.set(emptyProduct);
  }

  public onUpdate(product: Product) {
    this.isCreation = false;
    this.isDialogVisible = true;
    this.editedProduct.set(product);
  }

  public onDelete(product: Product) {
    this.productsService.delete(product.id).subscribe();
  }

  public onSave(product: Product) {
    if (this.isCreation) {
      this.productsService.create(product).subscribe();
    } else {
      this.productsService.update(product).subscribe();
    }
    this.closeDialog();
  }

  public onCancel() {
    this.closeDialog();
  }

  private closeDialog() {
    this.isDialogVisible = false;
  }

  navigateToDetail(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  applyFilters() {
    let filtered = this.products();

    // Text filter
    if (this.filterText) {
      const filterTextLower = this.filterText.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filterTextLower) ||
        p.description.toLowerCase().includes(filterTextLower) ||
        p.code.toLowerCase().includes(filterTextLower)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Sorting
    if (this.sortField) {
      const direction = this.sortField.startsWith('-') ? -1 : 1;
      const fieldName = this.sortField.replace('-', '') as keyof Product;

      filtered = [...filtered].sort((a, b) => {
        const valueA = a[fieldName] as string | number;
        const valueB = b[fieldName] as string | number;

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return valueA.localeCompare(valueB) * direction;
        } else {
          if (valueA < valueB) return -1 * direction;
          if (valueA > valueB) return 1 * direction;
          return 0;
        }
      });
    }

    this.totalRecords = filtered.length;

    // Pagination
    const startIndex = this.first;
    const endIndex = Math.min(startIndex + this.rows, filtered.length);
    this.filteredProducts = filtered.slice(startIndex, endIndex);
  }

  onFilterChange() {
    this.first = 0;
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.applyFilters();
  }

  addToCartWithQuantity(product: Product, quantity: number) {
    this.cartService.addToCartWithQuantity(product, quantity);
    this.messageService.add({
      severity: 'success',
      summary: 'Produit ajouté',
      detail: `${quantity} ${product.name} ${quantity > 1 ? 'ont été ajoutés' : 'a été ajouté'} à votre panier`
    });
  }

  addToCart(product: Product): void {
    this.addToCartWithQuantity(product, 1);
  }
}
