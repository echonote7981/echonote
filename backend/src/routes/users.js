const express = require('express');
const asyncHandler = require('express-async-handler');
const { Meeting } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Constants
const MAX_FREE_RECORDING_TIME = 14400; // 4 hours in seconds

/**
 * @route GET /api/users/stats
 * @desc Get user recording stats (total recorded time and remaining free time)
 * @access Public
 */
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    // Calculate total recorded time from all meetings
    const meetings = await Meeting.findAll({
      attributes: ['duration'],
      where: {
        duration: {
          [Op.not]: null
        }
      }
    });

    // Sum up all meeting durations (in seconds)
    const totalRecordedTime = meetings.reduce((total, meeting) => {
      return total + (meeting.duration || 0);
    }, 0);

    // Calculate remaining free time
    const remainingFreeTime = Math.max(0, MAX_FREE_RECORDING_TIME - totalRecordedTime);

    res.json({
      totalRecordedTime,
      remainingFreeTime
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
}));

module.exports = router;