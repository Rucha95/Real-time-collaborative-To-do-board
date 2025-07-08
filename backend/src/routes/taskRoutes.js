import express from 'express';
import Task from '../models/Task.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:userId', authenticateUser, async (req, res) => {
  const { userId } = req.params;

  if (req.user.userId !== userId) {
    return res.status(403).json({ msg: 'Forbidden: user ID mismatch' });
  }

  try {
    const { title, description, assignedTo, status, priority } = req.body;

    const task = new Task({
      title,
      description,
      status,
      priority,
      assignedTo,
      createdBy: userId
    });

    await task.save();
    res.status(201).json({ msg: 'Task created', task });
  } catch (err) {
    console.error('Create Task error:', err);
    if (err.code === 11000 && err.keyPattern?.title) {
        return res.status(400).json({ msg: 'Task title must be unique' });
      }
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/getAlltasks', authenticateUser, async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate('assignedTo', 'name email')   
        .populate('createdBy', 'name email')    
        .sort({ createdAt: -1 });              
  
      res.status(200).json({ tasks });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  });

export default router;
