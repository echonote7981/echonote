'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Meetings', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      });
      console.log('Added userId column to Meetings table');
    } catch (error) {
      console.log('Error adding userId column to Meetings (might already exist):', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Meetings', 'userId');
    } catch (error) {
      console.log('Error removing userId column from Meetings:', error.message);
    }
  }
};
