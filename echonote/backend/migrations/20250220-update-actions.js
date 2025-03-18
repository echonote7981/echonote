'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the old Actions table since it's empty
    await queryInterface.dropTable('Actions');

    // Create the new Actions table with the updated schema
    await queryInterface.createTable('Actions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      meetingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Meetings',
          key: 'id'
        }
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP + INTERVAL \'7 days\'')
      },
      priority: {
        type: Sequelize.ENUM('High', 'Medium', 'Low'),
        defaultValue: 'Medium',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed'),
        defaultValue: 'pending',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the new Actions table
    await queryInterface.dropTable('Actions');

    // Recreate the old Actions table
    await queryInterface.createTable('Actions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      meetingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Meetings',
          key: 'id'
        }
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  }
};
