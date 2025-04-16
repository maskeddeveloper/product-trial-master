import { DataTypes, Model, Sequelize } from 'sequelize';
import { WishlistAttributes } from '../interfaces';

export default (sequelize: Sequelize) => {
  const Wishlist = sequelize.define<Model<WishlistAttributes>>('Wishlist', {
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    hooks: {
      beforeUpdate: (wishlist: any) => {
        wishlist.updatedAt = new Date();
      }
    },
    timestamps: false // We manage timestamps manually
  });

  return Wishlist;
}; 