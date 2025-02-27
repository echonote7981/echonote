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
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Action.associate = (models) => {
    Action.belongsTo(models.Meeting, {
      foreignKey: 'meetingId',
      as: 'meeting'
    });
  };

  return Action;
};
