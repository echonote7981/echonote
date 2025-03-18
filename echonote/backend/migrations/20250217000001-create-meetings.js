'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Meetings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      audioPath: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transcript: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      highlights: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('processing', 'processed', 'failed'),
        defaultValue: 'processing',
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Meetings');
  }
};
