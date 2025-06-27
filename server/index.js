 import express from 'express';
 import dotenv from 'dotenv';
 import cors from 'cors';

 dotenv.config();

 const app = express();

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://fam-tree-frontend.vercel.app'); 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end(); // ✅ Critical for preflight
  }
  next();
});


 // ✅ use cors middleware
 app.use(cors({
   origin: 'https://fam-tree-frontend.vercel.app',
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
 }));

 app.use(express.json());

 import userRoutes from './routes/user.route.js';
 import passRoute from './routes/passRoute/pass.route.js';

 app.use('/api', userRoutes);
 app.use('/api', passRoute);

 app.listen(3000, () => {
     console.log("Server is running on port 3000");
 });
