// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';

// dotenv.config();

// const app = express();

// // ✅ use cors middleware
// app.use(cors());

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
import cors from 'cors'; // Import cors

dotenv.config();

const app = express();

// Define your allowed origin(s)
// IMPORTANT: Use the exact URL of your deployed frontend.
// Ensure there's no trailing slash unless your frontend always includes it in requests.
const allowedOrigins = [
  'https://fam-tree-frontend-djd4j3vxa-commandos-projects.vercel.app',
  // You might want to add your localhost for development:
  'http://localhost:5173', // or whatever port your frontend runs on (e.g., 3000, 8080, 5173 for Vite default)
  // Add other origins if necessary (e.g., specific preview deployments)
];

// Configure CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies to be sent with requests (important for authentication)
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 200, use 204
}));


app.use(express.json());

import userRoutes from './routes/user.route.js';
import passRoute from './routes/passRoute/pass.route.js';

app.use('/api', userRoutes);
app.use('/api', passRoute);

const PORT = process.env.PORT || 3000; // Use process.env.PORT for Vercel/production

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
