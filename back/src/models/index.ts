import { Sequelize } from 'sequelize';
import path from 'path';

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
});

// Import models
import userModel from './user.model';
import productModel from './product.model';
import cartModel from './cart.model';
import cartItemModel from './cartItem.model';
import wishlistModel from './wishlist.model';

// Initialize models
const User = userModel(sequelize);
const Product = productModel(sequelize);
const Cart = cartModel(sequelize);
const CartItem = cartItemModel(sequelize);
const Wishlist = wishlistModel(sequelize);

// Define associations
User.hasOne(Cart);
Cart.belongsTo(User);

User.hasOne(Wishlist);
Wishlist.belongsTo(User);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

Product.hasMany(CartItem);
CartItem.belongsTo(Product);

Wishlist.belongsToMany(Product, { through: 'WishlistProducts' });
Product.belongsToMany(Wishlist, { through: 'WishlistProducts' });

// Export models and sequelize instance
export {
  sequelize,
  User,
  Product,
  Cart,
  CartItem,
  Wishlist
}; 