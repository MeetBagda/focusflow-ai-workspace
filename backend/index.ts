import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import noteRoutes from './routes/notes';
import { initDb } from './lib/db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize routes
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);

// Initialize database
initDb().then(() => {
  console.log('Database initialized');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});