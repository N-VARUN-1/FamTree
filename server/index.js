// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';

// dotenv.config();

// const app = express();

// // ✅ use cors middleware
// app.use(cors({
//   origin: 'https://fam-tree-frontend.vercel.app',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Explicitly handle OPTIONS requests for all routes
// app.options('*', cors());


// app.use(express.json());

// import userRoutes from './routes/user.route.js';
// import passRoute from './routes/passRoute/pass.route.js';

// app.use('/api', userRoutes);
// app.use('/api', passRoute);

// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// });




import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Custom CORS middleware - handles all requests including OPTIONS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://fam-tree-frontend.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Immediately respond to OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Import and use routes
import userRoutes from './routes/user.route.js';
import passRoute from './routes/passRoute/pass.route.js';

app.use('/api', userRoutes);
app.use('/api', passRoute);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
