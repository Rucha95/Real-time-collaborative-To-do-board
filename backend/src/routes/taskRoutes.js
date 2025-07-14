import express from 'express';
import Task from '../models/Task.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import ChangeLog from '../models/ChangeLog.js';
import User from '../models/User.js';

const router = express.Router();

const logChange = async (taskId, userId, action, fieldChanged = null, oldValue = null, newValue = null, details = null,io=null) => {
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
    const savedLog = await log.save();
    const populatedLog = await savedLog.populate([
        { path: 'taskId', select: 'title' },
        { path: 'userId', select: 'name' },
      ]);
      if(io){
        io.emit('changelogs', populatedLog);
        console.log("changelogs"+populatedLog);
    }
    
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
    console.log("check assigned To" , req.body.assignedTo);

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
            .populate('userId', 'name') 
            .populate('taskId', 'title') 
            .lean(); 

        res.status(200).json(changeLogs);
    } catch (error) {
        console.error('Error fetching recent change logs:', error);
        res.status(500).json({ message: 'Failed to fetch recent change logs', error: error.message });
    }
});

router.patch('/:taskId/status', authenticateUser, async (req, res) => {
    const { taskId } = req.params;
    const { newStatus } = req.body;
    const userId = req.user.userId;
  
    try {
      const task = await Task.findById(taskId);
      console.log("task Id is:"+task);
      if (!task) return res.status(404).json({ message: 'Task not found' });
  
      const oldStatus = task.status;
      if (oldStatus === newStatus) {
        return res.status(200).json({ message: 'Status unchanged' });
      }
  
      task.status = newStatus;
      await task.save();
      const io = req.io;
      

    //console.log(`Change logged & emitted: Task ${taskId}, Action: ${action}`);
    await logChange(
        task._id,
        userId,
        'status_changed',
        'status',
        oldStatus,
        newStatus,
        `Status changed from ${oldStatus} to ${newStatus}`,
        io
        );
  
  
      res.status(200).json({ message: 'Status updated', task });
    } catch (err) {
      console.error('Error updating task status:', err);
      res.status(500).json({ message: 'Failed to update status' });
    }
  });

export default router;
