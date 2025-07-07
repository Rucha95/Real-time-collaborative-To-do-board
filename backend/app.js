import express from 'express'; //ES6 modules
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.port || 3001;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello");
})


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

app.use('/api/auth', authRoutes);



