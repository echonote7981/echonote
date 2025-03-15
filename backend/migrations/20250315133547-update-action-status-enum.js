'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // For PostgreSQL - we need to modify the enum type
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_Actions_status" ADD VALUE IF NOT EXISTS \'not_reviewed\''
    );
    await queryInterface.sequelize.query(
      'ALTER TYPE "enum_Actions_status" ADD VALUE IF NOT EXISTS \'in_progress\''
    );

    // If you have existing rows that need to be updated, you can do so here
    // This query will convert any 'pending' actions to 'not_reviewed' if they have hasBeenOpened=false
    await queryInterface.sequelize.query(
      'UPDATE "Actions" SET status = \'not_reviewed\' WHERE status = \'pending\' AND "hasBeenOpened" = false'
    );
  },

  async down (queryInterface, Sequelize) {
    // Unfortunately, PostgreSQL doesn't allow removing values from an enum type
    // without recreating the type. This would require a more complex migration with
    // table recreation, which we'll skip for the down migration.
    console.log('Cannot remove enum values in PostgreSQL without recreating the type.');
  }
};
