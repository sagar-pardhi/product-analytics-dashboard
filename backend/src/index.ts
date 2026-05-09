import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { initializeDB } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

async function start() {
  await initializeDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(console.error);
