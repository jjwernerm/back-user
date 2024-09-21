import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/connectDB.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(express.json());
dotenv.config();
connectDB();

const allowedDomains = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    };
  },
};

app.use(cors(corsOptions));

app.use('/user', userRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server connected to port ${PORT}`);
});