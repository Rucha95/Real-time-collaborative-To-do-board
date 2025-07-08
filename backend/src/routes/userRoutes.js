import express from 'express';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/getAllUsers', authenticateUser, async (req, res) => {
  try {
    const users = await User.find({}, 'name email');
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;