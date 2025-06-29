import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// Define corsOptions object
const corsOptions = {
  origin: "https://fam-tree-frontend.vercel.app",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: true,
  optionsSuccessStatus: 200 
};

// Use cors middleware with the defined options
app.use(cors(corsOptions));


// Handle preflight OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://fam-tree-frontend.vercel.app');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(express.json());

import userRoutes from './routes/user.route.js';
import passRoute from './routes/passRoute/pass.route.js';

app.use('/api', userRoutes);
app.use('/api', passRoute);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
