'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create User table if it doesn't exist
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      hasAcceptedTerms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      hasAcceptedPrivacyPolicy: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isPremium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).catch(error => {
      // Table might already exist
      console.log('Users table creation error (might already exist):', error.message);
    });

    // If the table already exists, add the columns
    try {
      await queryInterface.addColumn('Users', 'hasAcceptedTerms', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
      console.log('Added hasAcceptedTerms column');
    } catch (error) {
      console.log('Error adding hasAcceptedTerms column (might already exist):', error.message);
    }

    try {
      await queryInterface.addColumn('Users', 'hasAcceptedPrivacyPolicy', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
      console.log('Added hasAcceptedPrivacyPolicy column');
    } catch (error) {
      console.log('Error adding hasAcceptedPrivacyPolicy column (might already exist):', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Users', 'hasAcceptedTerms');
      await queryInterface.removeColumn('Users', 'hasAcceptedPrivacyPolicy');
    } catch (error) {
      console.log('Error removing columns:', error.message);
    }
  }
};
