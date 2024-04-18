import express from 'express';
import mongodb from './config/mongoose.js';
import { dirname, join } from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import gAuthRouter from './routes/gAuthRouter.js';
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();
// Serve static files from the 'attachmentsDownloaded' directory
app.use(express.static(join(__dirname, 'attachmentsDownloaded')));
mongodb();
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', gAuthRouter);

app.listen(process.env.PORT, () => {
  console.log(`server started on port ${process.env.PORT}`);
});
