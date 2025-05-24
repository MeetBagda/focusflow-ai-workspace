import cors from 'cors';

export const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
});