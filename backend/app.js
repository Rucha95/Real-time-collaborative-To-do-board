import express from 'express'; //ES6 modules
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.port || 3000;

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



