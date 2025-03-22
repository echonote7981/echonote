const express = require('express');
const asyncHandler = require('express-async-handler');
const { Meeting, User } = require('../models');
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

/**
 * @route GET /api/users/preferences
 * @desc Get user preferences including terms acceptance status
 * @access Public
 */
router.get('/preferences', asyncHandler(async (req, res) => {
  try {
    // Get user email from request (in a real app, this would come from authentication)
    const userEmail = req.query.email || 'default@example.com';

    // Find or create user
    const [user] = await User.findOrCreate({
      where: { email: userEmail },
      defaults: {
        hasAcceptedTerms: false,
        hasAcceptedPrivacyPolicy: false,
        isPremium: false
      }
    });

    res.json({
      hasAcceptedTerms: user.hasAcceptedTerms,
      hasAcceptedPrivacyPolicy: user.hasAcceptedPrivacyPolicy,
      isPremium: user.isPremium
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Failed to fetch user preferences' });
  }
}));

/**
 * @route POST /api/users/preferences
 * @desc Update user preferences including terms acceptance
 * @access Public
 */
router.post('/preferences', asyncHandler(async (req, res) => {
  try {
    // Get user email from request (in a real app, this would come from authentication)
    const userEmail = req.body.email || 'default@example.com';
    
    // Extract preferences from request body
    const { hasAcceptedTerms, hasAcceptedPrivacyPolicy, isPremium } = req.body;
    
    // Find or create user
    const [user] = await User.findOrCreate({
      where: { email: userEmail },
      defaults: {
        hasAcceptedTerms: false,
        hasAcceptedPrivacyPolicy: false,
        isPremium: false
      }
    });
    
    // Update user preferences
    if (hasAcceptedTerms !== undefined) {
      user.hasAcceptedTerms = hasAcceptedTerms;
    }
    
    if (hasAcceptedPrivacyPolicy !== undefined) {
      user.hasAcceptedPrivacyPolicy = hasAcceptedPrivacyPolicy;
    }
    
    if (isPremium !== undefined) {
      user.isPremium = isPremium;
    }
    
    // Save changes
    await user.save();
    
    res.json({
      message: 'User preferences updated successfully',
      hasAcceptedTerms: user.hasAcceptedTerms,
      hasAcceptedPrivacyPolicy: user.hasAcceptedPrivacyPolicy,
      isPremium: user.isPremium
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Failed to update user preferences' });
  }
}));

module.exports = router;