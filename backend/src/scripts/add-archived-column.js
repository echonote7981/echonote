'use strict';

const { sequelize } = require('../models');

async function addArchivedColumn() {
  try {
    console.log('Starting script to add archived column to Actions table...');
    
    // First check if the column exists
    const [results] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Actions' AND column_name='archived'`
    );
    
    if (results.length === 0) {
      console.log('Column "archived" does not exist in Actions table. Adding it now...');
      
      // Add the column if it doesn't exist
      await sequelize.query(
        `ALTER TABLE "Actions" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false`
      );
      
      console.log('✅ Successfully added "archived" column to Actions table');
    } else {
      console.log('Column "archived" already exists in Actions table');
    }
    
    // Make sure indexes are correctly set
    console.log('Checking for indexes on archived column...');
    
    // Create an index on the archived column for faster queries
    await sequelize.query(
      `CREATE INDEX IF NOT EXISTS "actions_archived_idx" ON "Actions" ("archived")`
    );
    
    console.log('✅ Successfully set up indexes for archived column');
    
    console.log('Script completed successfully!');
  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
addArchivedColumn();
