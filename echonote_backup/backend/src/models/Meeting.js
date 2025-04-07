const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Meeting = sequelize.define('Meeting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('processing', 'processed', 'failed'),
      defaultValue: 'processing',
      allowNull: false
    },
    transcript: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    highlights: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    timestamps: true
  });

  Meeting.associate = (models) => {
    Meeting.hasMany(models.Action, {
      foreignKey: 'meetingId',
      as: 'actions'
    });
  };

  return Meeting;
};
