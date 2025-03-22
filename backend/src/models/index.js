const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

console.log('Database config:', {
  database: config.database,
  username: config.username,
  host: config.host,
  port: config.port,
  dialect: config.dialect
});

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Import Sequelize DataTypes
const { DataTypes } = Sequelize;

// Import models
const Meeting = require('./Meeting')(sequelize, DataTypes);
const Action = require('./Action')(sequelize, DataTypes);
const ArchivedMeeting = require('./ArchivedMeeting')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);

// Initialize models
const models = {
  Meeting,
  Action,
  ArchivedMeeting,
  User
};

// Run associations if they exist
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

module.exports = {
  sequelize,
  ...models
};
