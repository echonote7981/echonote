'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    hasAcceptedTerms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasAcceptedPrivacyPolicy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});

  User.associate = function(models) {
    // User can have many meetings
    User.hasMany(models.Meeting, {
      foreignKey: 'userId',
      as: 'meetings'
    });
  };

  return User;
};
