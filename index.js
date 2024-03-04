import express from 'express';
import mongodb from './config/mongoose.js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import checkToken from './middleware/checkToken.js';
import UserRouter from './routes/userRoutes.js';
import authRouter from './routes/authRouter.js';
import gAuthRouter from './routes/gAuthRouter.js';
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve static files from the 'attachmentsDownloaded' directory
app.use(express.static(join(__dirname, 'attachmentsDownloaded')));
dotenv.config();
mongodb();
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/auth', authRouter);
app.use('/gauth', gAuthRouter);

app.listen(process.env.PORT, () => {
  console.log(`server started on port ${process.env.PORT}`);
});
