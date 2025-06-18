import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// ✅ use cors middleware
app.use(cors());

app.use(express.json());

import userRoutes from './routes/user.route.js';
import passRoute from './routes/passRoute/pass.route.js';

app.use('/api', userRoutes);
app.use('/api', passRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
