import { DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import { UserAttributes } from '../interfaces';

export default (sequelize: Sequelize) => {
  const User = sequelize.define<Model<UserAttributes>>('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCreate: async (user: any) => {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        
        // Set admin status
        if (user.email === 'admin@admin.com') {
          user.isAdmin = true;
        }
      },
      beforeUpdate: async (user: any) => {
        // Hash password if changed
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to compare passwords
  (User as any).prototype.comparePassword = async function(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  return User;
}; 