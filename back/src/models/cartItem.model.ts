import { DataTypes, Model, Sequelize } from 'sequelize';
import { CartItemAttributes } from '../interfaces';

export default (sequelize: Sequelize) => {
  const CartItem = sequelize.define<Model<CartItemAttributes>>('CartItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    }
  });

  return CartItem;
}; 