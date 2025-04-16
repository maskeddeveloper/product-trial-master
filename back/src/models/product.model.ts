import { DataTypes, Model, Sequelize } from 'sequelize';
import { ProductAttributes } from '../interfaces';

export default (sequelize: Sequelize) => {
  const Product = sequelize.define<Model<ProductAttributes>>('Product', {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    internalReference: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shellId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inventoryStatus: {
      type: DataTypes.ENUM('INSTOCK', 'LOWSTOCK', 'OUTOFSTOCK'),
      allowNull: false
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.INTEGER,
      defaultValue: () => Math.floor(Date.now() / 1000)
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      defaultValue: () => Math.floor(Date.now() / 1000)
    }
  }, {
    hooks: {
      beforeUpdate: (product: any) => {
        product.updatedAt = Math.floor(Date.now() / 1000);
      }
    },
    timestamps: false // We manage timestamps manually
  });

  return Product;
}; 