const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Action = sequelize.define('Action', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    meetingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Meetings',
        key: 'id'
      }
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 1 week from now
    },
    priority: {
      type: DataTypes.ENUM('High', 'Medium', 'Low'),
      defaultValue: 'Medium',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
      set(value) {
        console.log('Setting status:', { 
          oldValue: this.getDataValue('status'),
          newValue: value,
          stack: new Error().stack 
        });
        this.setDataValue('status', value);
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hasBeenOpened: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    timestamps: true,
    hooks: {
      beforeUpdate: (instance, options) => {
        console.log('Before Update:', {
          changing: instance.changed(),
          attributes: instance.get(),
          options
        });
      },
      afterUpdate: (instance, options) => {
        console.log('After Update:', {
          attributes: instance.get(),
          options
        });
      }
    }
  });

  Action.associate = (models) => {
    Action.belongsTo(models.Meeting, {
      foreignKey: 'meetingId',
      as: 'meeting'
    });
  };

  return Action;
};
