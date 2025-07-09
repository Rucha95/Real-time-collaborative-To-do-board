import express from 'express';
import Task from '../models/Task.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import ChangeLog from '../models/ChangeLog.js';
import User from '../models/User.js';

const router = express.Router();

const logChange = async (taskId, userId, action, fieldChanged = null, oldValue = null, newValue = null, details = null) => {
    try {
        const log = new ChangeLog({
            taskId,
            userId,
            action,
            fieldChanged,
            oldValue,
            newValue,
            details,
        });
        await log.save();
        console.log(`Change logged: Task ${taskId}, Action: ${action}, By User: ${userId}`);
    } catch (error) {
        console.error('Error logging change:', error);
    }
};

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
      createdBy: userId,
      version:1
    });

    const io = req.io;
    io.emit('taskCreated', task); 

    await task.save();
    
    await logChange(task._id, userId, 'added', null, null, task.toObject(), `Task '${task.title}' created.`);
    if (assignedTo) {
        await User.findByIdAndUpdate(assignedTo, { $inc: { activeTasksCount: 1 } });
    }
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

router.get('/changelogs',authenticateUser, async (req, res) => {
    try {
        const changeLogs = await ChangeLog.find()
            .sort({ timestamp: -1 }) 
            .limit(20) 
            .populate('userId', 'username') 
            .populate('taskId', 'title') 
            .lean(); 

        res.status(200).json(changeLogs);
    } catch (error) {
        console.error('Error fetching recent change logs:', error);
        res.status(500).json({ message: 'Failed to fetch recent change logs', error: error.message });
    }
});

export default router;
