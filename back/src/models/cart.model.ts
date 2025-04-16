import { DataTypes, Model, Sequelize } from 'sequelize';
import { CartAttributes } from '../interfaces';

export default (sequelize: Sequelize) => {
  const Cart = sequelize.define<Model<CartAttributes>>('Cart', {
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    hooks: {
      beforeUpdate: (cart: any) => {
        cart.updatedAt = new Date();
      }
    },
    timestamps: false // We manage timestamps manually
  });

  return Cart;
}; 