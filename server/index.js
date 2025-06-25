 import express from 'express';
 import dotenv from 'dotenv';
 import cors from 'cors';
 import createProxyMiddleware from 'http-proxy-middleware';

 dotenv.config();

 const app = express();

 // ✅ use cors middleware
 app.use(cors({
   origin: 'https://fam-tree-frontend.vercel.app',
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
 }));

// Add this BEFORE your routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'https://fam-tree-frontend.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).json({});
  }
  next();
});

const exampleProxy = createProxyMiddleware({
  target: 'https://fam-tree-frontend.vercel.app', // target host with the same base path
  changeOrigin: true, // needed for virtual hosted sites
});

app.use('/api', exampleProxy);

 app.use(express.json());

 import userRoutes from './routes/user.route.js';
 import passRoute from './routes/passRoute/pass.route.js';

 app.use('/api', userRoutes);
 app.use('/api', passRoute);

 app.listen(3000, () => {
     console.log("Server is running on port 3000");
 });
