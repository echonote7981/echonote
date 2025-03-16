const express = require('express');
const asyncHandler = require('express-async-handler');
const { Action, Meeting, sequelize } = require('../models');

const router = express.Router();

// Cleanup pending actions
router.post('/cleanup', asyncHandler(async (req, res) => {
  try {
    const { action, meetingId } = req.body;
    let whereClause = { status: 'pending' };
    
    // If meetingId is provided, only clean up for that meeting
    if (meetingId) {
      whereClause.meetingId = meetingId;
    }
    
    let result;
    switch(action) {
      case 'delete':
        result = await Action.destroy({ where: whereClause });
        break;
      case 'complete':
        result = await Action.update(
          { status: 'completed', completedAt: new Date() },
          { where: whereClause }
        );
        break;
      case 'archive':
        result = await Action.update(
          { archived: true },
          { where: whereClause }
        );
        break;
      default:
        return res.status(400).json({ message: 'Invalid action. Use delete, complete, or archive.' });
    }
    
    res.json({ message: `Successfully performed ${action} on ${result} pending action items` });
  } catch (error) {
    console.error('Failed to clean up actions:', error);
    res.status(500).json({ message: 'Failed to clean up actions', error: error.message });
  }
}));

// Get all actions
router.get('/', asyncHandler(async (req, res) => {
  try {
    const where = {};
    
    // Filter by status if provided
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    // Filter by archived status if explicitly provided
    if (req.query.archived !== undefined) {
      // Convert string query parameter to boolean
      where.archived = req.query.archived === 'true';
      console.log(`Filtering actions by archived=${where.archived}`);
    }
    
    console.log('Fetching actions with where clause:', JSON.stringify(where));

    const actions = await Action.findAll({
      where,
      order: [['dueDate', 'ASC']]
    });
    
    console.log(`Found ${actions.length} actions matching criteria`);
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
  
  console.log('Fetched action by ID:', JSON.stringify(action.toJSON(), null, 2));
  res.json(action);
}));

// Create new action
router.post('/', asyncHandler(async (req, res) => {
  try {
    console.log('Creating action with data:', JSON.stringify(req.body, null, 2));
    const action = await Action.create(req.body);
    console.log('Created action:', JSON.stringify(action.toJSON(), null, 2));
    res.status(201).json(action);
  } catch (error) {
    console.error('Failed to create action:', error);
    res.status(500).json({ message: 'Failed to create action' });
  }
}));

// Update action
router.put('/:id', asyncHandler(async (req, res) => {
  try {
    console.log('Update request received:', {
      id: req.params.id,
      body: req.body
    });
    
    // First get the current action
    const currentAction = await Action.findByPk(req.params.id);
    if (!currentAction) {
      res.status(404).json({ message: 'Action not found' });
      return;
    }

    console.log('Current action state:', currentAction.toJSON());

    // Only update fields that are explicitly provided
    const updates = {};
    if ('title' in req.body) updates.title = req.body.title;
    if ('notes' in req.body) updates.notes = req.body.notes;
    if ('details' in req.body) updates.details = req.body.details;
    if ('hasBeenOpened' in req.body) updates.hasBeenOpened = req.body.hasBeenOpened;
    
    // Handle archived flag explicitly
    if ('archived' in req.body) {
      console.log(`🏁 Setting archived flag to: ${req.body.archived}`);
      updates.archived = req.body.archived;
      
      // If we're archiving an item, also mark it as completed if it isn't already
      if (req.body.archived === true && currentAction.status !== 'completed') {
        updates.status = 'completed';
        updates.completedAt = new Date();
        console.log('🔄 Auto-completing action as part of archiving');
      }
    }
    
    // Don't include status in updates unless explicitly provided
    if ('status' in req.body) {
      updates.status = req.body.status;
      
      // Set completedAt timestamp when status changes to completed
      if (req.body.status === 'completed' && currentAction.status !== 'completed') {
        updates.completedAt = new Date();
      } else if (req.body.status !== 'completed' && currentAction.status === 'completed') {
        // Clear completedAt if moving from completed to another status
        updates.completedAt = null;
      }
    }
    
    console.log('Applying updates:', updates);
    
    // Use raw update to bypass any model defaults
    const updateFields = Object.keys(updates).map(field => `"${field}" = :${field}`).join(', ');
    await sequelize.query(
      `UPDATE "Actions" SET ${updateFields} WHERE id = :id`,
      {
        replacements: {
          ...updates,
          id: req.params.id
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    // Get the updated action
    const updatedAction = await Action.findByPk(req.params.id);
    console.log('Final action state:', updatedAction.toJSON());
    res.json(updatedAction);
  } catch (error) {
    console.error('Failed to update action:', error);
    res.status(500).json({ message: 'Failed to update action' });
  }
}));

// Save notes for an action
router.put('/:id/notes', asyncHandler(async (req, res) => {
  try {
    const { title, notes } = req.body;
    
    console.log('Saving notes:', {
      id: req.params.id,
      title,
      notes
    });

    // Use direct SQL to update only title and notes, and force status to stay pending
    await sequelize.query(
      `UPDATE "Actions" 
       SET title = :title, 
           notes = :notes, 
           status = 'pending',
           "updatedAt" = NOW()
       WHERE id = :id`,
      {
        replacements: {
          id: req.params.id,
          title,
          notes
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    // Get updated action
    const action = await Action.findByPk(req.params.id);
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }
    
    console.log('Updated action:', action.toJSON());
    res.json(action);
  } catch (error) {
    console.error('Failed to save notes:', error);
    res.status(500).json({ message: 'Failed to save notes' });
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
