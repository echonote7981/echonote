const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ArchivedMeeting = sequelize.define('ArchivedMeeting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    originalMeetingId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
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

  return ArchivedMeeting;
};
