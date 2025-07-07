import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (user) =>{
    const payload = {userId: user._id, email: user.email};
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    return jwt.sign(payload, secret,{expiresIn});
}

router.post('/signup',async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        const exists = await(User.findOne({email}));
        if(exists) return res.status(400).json({msg:'User already exists.'})

        const passwordHash = await(bcrypt.hash(password,10));
        const user = await User.create({name,email,passwordHash});

        const token = generateToken(user);
        res.status(201).json({ msg: 'User registered successfully!',token, user: { id: user._id, name: user.name, email: user.email } });
    }catch(err){
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/login', async(req,res)=>{
    try{
        const{email,password} = req.body;
        const user = await(User.findOne({email}));
        if(!user) return res.status(400).json({msg : 'Invalid credentials'});
        
        const isMatch = await bcrypt.compare(password,user.passwordHash);
        if(!isMatch) return res.status(400).json({msg: 'Invalid credentials'});

        const token = generateToken(user);
        res.status(200).json({msg:'User LoggedIn successfully!',token, user:{id:user._id,name:user.name,email:user.email}});
        
    }
    catch(err){
        console.error(err);
        res.status(500).json({msg:'Server error'});
    }
});

export default router;