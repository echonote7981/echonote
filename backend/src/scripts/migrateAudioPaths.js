const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log('Starting audio path migration...');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: false
  }
);

const migrateAudioPaths = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // First, check if the audioPath column exists
    const [results] = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'Meetings' AND column_name = 'audioPath'`
    );

    if (results.length === 0) {
      console.log('No audioPath column found. No migration needed.');
      process.exit(0);
    }

    // Get all meetings with audioPath but no audioUrl
    const [meetings] = await sequelize.query(
      `SELECT id, "audioPath" FROM "Meetings" 
       WHERE "audioPath" IS NOT NULL AND ("audioUrl" IS NULL OR "audioUrl" = '')`
    );

    console.log(`Found ${meetings.length} meetings that need migration`);

    // Update each meeting
    for (const meeting of meetings) {
      console.log(`Migrating meeting ${meeting.id}`);
      await sequelize.query(
        `UPDATE "Meetings" SET "audioUrl" = :audioPath WHERE id = :id`,
        {
          replacements: { audioPath: meeting.audioPath, id: meeting.id }
        }
      );
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

migrateAudioPaths();
