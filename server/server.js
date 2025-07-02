import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './Routes/authRoutes.js'; 
import userRouter from './Routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = [
  'http://localhost:5173', // React app
  'https://your-production-domain.com' // Replace with your production domain
];


app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials:true}));

// API Endpoints
app.get('/', (req,res) => res.send('Welcome to the server!'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});


 



