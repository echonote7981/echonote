const cron = require('node-cron');
const { ArchivedMeeting, Action } = require('../models');
const { Op } = require('sequelize');

/**
 * Initializes scheduled cleanup tasks for the application
 */
const initCleanupTasks = () => {
  console.log('Initializing automatic cleanup tasks');
  
  // Schedule archived meetings cleanup - runs at midnight every day
  // Cron format: second(0-59) minute(0-59) hour(0-23) day(1-31) month(1-12) weekday(0-6, 0=Sunday)
  cron.schedule('0 0 0 * * *', async () => {
    try {
      console.log(`[${new Date().toISOString()}] Starting scheduled cleanup of old archived meetings`);
      
      // Calculate cutoff date (15 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 1);
      console.log(`Deleting archived meetings older than: ${cutoffDate.toISOString()}`);
      
      // Delete meetings older than the cutoff date
      const deletedCount = await ArchivedMeeting.destroy({
        where: {
          date: {
            [Op.lt]: cutoffDate
          }
        }
      });
      
      console.log(`[${new Date().toISOString()}] Scheduled cleanup complete. Deleted ${deletedCount} archived meetings older than 15 days.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error during scheduled cleanup:`, error);
    }
  }, {
    scheduled: true,
    timezone: "America/New_York" // Adjust this to your timezone
  });

  // Schedule archived tasks cleanup - runs at 1 AM every day
  cron.schedule('0 0 1 * * *', async () => {
    try {
      console.log(`[${new Date().toISOString()}] Starting scheduled cleanup of old archived tasks`);
      
      // Calculate cutoff date (15 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 15); // Using the same 15-day threshold as meetings
      console.log(`Deleting archived tasks older than: ${cutoffDate.toISOString()}`);
      
      // Delete tasks that are completed and older than the cutoff date
      const deletedCount = await Action.destroy({
        where: {
          // Must be completed
          status: 'completed',
          // Must be older than cutoff date
          updatedAt: {
            [Op.lt]: cutoffDate
          }
        }
      });
      
      console.log(`[${new Date().toISOString()}] Scheduled cleanup complete. Deleted ${deletedCount} archived tasks older than 15 days.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error during scheduled tasks cleanup:`, error);
    }
  }, {
    scheduled: true,
    timezone: "America/New_York" // Adjust this to your timezone
  });
  
  console.log('Automatic cleanup tasks initialized successfully');
};

/**
 * Manually trigger a cleanup of old archived meetings
 * @param {number} daysThreshold - Number of days after which to delete meetings
 * @returns {Promise<number>} - Number of deleted meetings
 */
const cleanupOldArchivedMeetings = async (daysThreshold = 15) => {
  try {
    console.log(`Manual cleanup triggered for meetings older than ${daysThreshold} days`);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    
    // Delete meetings older than the cutoff date
    const deletedCount = await ArchivedMeeting.destroy({
      where: {
        date: {
          [Op.lt]: cutoffDate
        }
      }
    });
    
    console.log(`Manual cleanup complete. Deleted ${deletedCount} archived meetings.`);
    return deletedCount;
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    throw error;
  }
};

/**
 * Manually trigger a cleanup of old archived tasks
 * @param {number} daysThreshold - Number of days after which to delete tasks
 * @returns {Promise<number>} - Number of deleted tasks
 */
const cleanupOldArchivedTasks = async (daysThreshold = 15) => {
  try {
    console.log(`Manual cleanup triggered for tasks older than ${daysThreshold} days`);
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    
    // Delete tasks that are completed and older than the cutoff date
    const deletedCount = await Action.destroy({
      where: {
        // Must be completed
        status: 'completed',
        // Must be older than cutoff date
        updatedAt: {
          [Op.lt]: cutoffDate
        }
      }
    });
    
    console.log(`Manual tasks cleanup complete. Deleted ${deletedCount} archived tasks.`);
    return deletedCount;
  } catch (error) {
    console.error('Error during manual tasks cleanup:', error);
    throw error;
  }
};

module.exports = {
  initCleanupTasks,
  cleanupOldArchivedMeetings,
  cleanupOldArchivedTasks
};
