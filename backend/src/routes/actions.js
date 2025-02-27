const express = require('express');
const asyncHandler = require('express-async-handler');
const { Action, Meeting } = require('../models');

const router = express.Router();

// Get all actions
router.get('/', asyncHandler(async (req, res) => {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }

    const actions = await Action.findAll({
      where,
      order: [['dueDate', 'ASC']]
    });
    res.json(actions);
  } catch (error) {
    console.error('Failed to fetch actions:', error);
    res.status(500).json({ message: 'Failed to fetch actions' });
  }
}));

// Get actions by meeting
router.get('/meeting/:meetingId', asyncHandler(async (req, res) => {
  try {
    const actions = await Action.findAll({
      where: { meetingId: req.params.meetingId },
      order: [['dueDate', 'ASC']]
    });
    res.json(actions);
  } catch (error) {
    console.error('Failed to fetch actions:', error);
    res.status(500).json({ message: 'Failed to fetch actions' });
  }
}));

// Get single action
router.get('/:id', asyncHandler(async (req, res) => {
  const action = await Action.findByPk(req.params.id, {
    include: [{
      model: Meeting,
      as: 'meeting',
      attributes: ['title', 'date'],
    }],
  });
  
  if (!action) {
    res.status(404).json({ message: 'Action not found' });
    return;
  }
  
  res.json(action);
}));

// Create new action
router.post('/', asyncHandler(async (req, res) => {
  try {
    const action = await Action.create(req.body);
    res.status(201).json(action);
  } catch (error) {
    console.error('Failed to create action:', error);
    res.status(500).json({ message: 'Failed to create action' });
  }
}));

// Update action
router.put('/:id', asyncHandler(async (req, res) => {
  try {
    const [updated] = await Action.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAction = await Action.findByPk(req.params.id);
      res.json(updatedAction);
    } else {
      res.status(404).json({ message: 'Action not found' });
    }
  } catch (error) {
    console.error('Failed to update action:', error);
    res.status(500).json({ message: 'Failed to update action' });
  }
}));

// Delete action
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    const deleted = await Action.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Action not found' });
    }
  } catch (error) {
    console.error('Failed to delete action:', error);
    res.status(500).json({ message: 'Failed to delete action' });
  }
}));

// Batch update actions (e.g., marking multiple as complete)
router.post('/batch', asyncHandler(async (req, res) => {
  const { ids, updates } = req.body;
  
  await Action.update(updates, {
    where: {
      id: ids,
    },
  });

  const updatedActions = await Action.findAll({
    where: {
      id: ids,
    },
  });

  res.json(updatedActions);
}));

module.exports = router;
