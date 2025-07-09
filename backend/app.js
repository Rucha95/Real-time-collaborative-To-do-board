import express from 'express'; //ES6 modules
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
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

app.use(cors());
app.use(express.json());
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

// const DB_URI = process.env.MONGO_URI;
// const connectAndSyncIndexes = async () => {
//     try{
//         await mongoose.connect(DB_URI);
//     console.log('MongoDB connected');

//     await User.syncIndexes(); 
//     console.log('Indexes synced');
//     }
//     catch (err) {
//         console.error('Error syncing indexes:', err);
//       }
// }
// connectAndSyncIndexes();


app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/tasks', taskRoutes);
app.use('/v1/api/users', userRoutes);



