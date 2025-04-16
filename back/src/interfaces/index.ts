export interface UserAttributes {
  id?: number;
  username: string;
  firstname: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductAttributes {
  id?: number;
  code: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
  internalReference: string;
  shellId: number;
  inventoryStatus: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';
  rating: number;
  createdAt: number;
  updatedAt: number;
}

export interface CartAttributes {
  id?: number;
  UserId?: number;
  updatedAt: Date;
}

export interface CartItemAttributes {
  id?: number;
  CartId?: number;
  ProductId?: number;
  quantity: number;
}

export interface WishlistAttributes {
  id?: number;
  UserId?: number;
  updatedAt: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
  isAdmin: boolean;
} 