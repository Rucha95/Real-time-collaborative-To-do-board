import express from 'express'; 
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import cors from 'cors';
import taskRoutes from './src/routes/taskRoutes.js';
import Task from './src/models/Task.js';
import http from 'http';
import { Server } from 'socket.io';
import userRoutes from './src/routes/userRoutes.js';
import ChangeLog from './src/models/ChangeLog.js';
import User from './src/models/User.js';


dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.port || 3001;
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      credentials:true
    }
  });


app.set('io', io);

app.use(cors({
    origin: ['http://localhost:3000','https://real-time-collaborative-to-do-board-c0hlqyy0e-ruchs-projects.vercel.app'],
    credentials: true
  }));
app.use(express.json());

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

app.use((req, res, next) => {
    req.io = io;
    next();
  });

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("connected to mongodb..");

    app.listen(PORT,()=>{
        console.log(`server is running on http://localhost:${PORT}`);
    });
})
.catch((err)=>{
    console.error("mongodb connection error",err.message);
});

app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/tasks', taskRoutes);
app.use('/v1/api/users', userRoutes);



