 import express from 'express';
 import dotenv from 'dotenv';
 import cors from 'cors';

 dotenv.config();

 const app = express();

 // ✅ use cors middleware
 app.use(cors({
   origin: 'https://fam-tree-frontend.vercel.app',
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
 }));

 app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
 });

 app.use(express.json());

 import userRoutes from './routes/user.route.js';
 import passRoute from './routes/passRoute/pass.route.js';

 app.use('/api', userRoutes);
 app.use('/api', passRoute);

 app.listen(3000, () => {
     console.log("Server is running on port 3000");
 });
