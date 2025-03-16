'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the column already exists before trying to add it
      const tableInfo = await queryInterface.describeTable('Actions');
      
      if (!tableInfo.archived) {
        await queryInterface.addColumn('Actions', 'archived', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
        console.log('Success: Added archived column to Actions table');
      } else {
        console.log('Info: archived column already exists in Actions table');
      }
    } catch (error) {
      console.error('Error checking or adding archived column:', error.message);
      // If the error is not about the column already existing, re-throw it
      if (!error.message.includes('column "archived" of relation "Actions" already exists')) {
        throw error;
      } else {
        console.log('Warning: Attempted to add archived column that might already exist');
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Attempt to remove the column
      await queryInterface.removeColumn('Actions', 'archived');
      console.log('Success: Removed archived column from Actions table');
    } catch (error) {
      console.error('Error removing archived column:', error.message);
      // If the error is not about the column not existing, re-throw it
      if (!error.message.includes('column "archived" of relation "Actions" does not exist')) {
        throw error;
      } else {
        console.log('Warning: Attempted to remove archived column that does not exist');
      }
    }
  }
};
