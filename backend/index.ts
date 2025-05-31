import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { clerkMiddleware  } from '@clerk/express'; // Import authMiddleware from @clerk/express
import taskRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import noteRoutes from './routes/notes';
import { initDb, query } from './lib/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Extend the Express Request type to include Clerk's auth properties (auth, userId, etc.)
// authMiddleware populates req.auth directly.
declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string | null;
        sessionId: string | null;
        orgId: string | null;
        // FIX: Add the 'user' property to the auth object
        user?: { // Make it optional, as it might not always be present or fully populated
          emailAddresses?: Array<{
            emailAddress: string;
            // Add other properties of emailAddresses if needed, e.g., id, verification, etc.
          }>;
          // Add other user properties you might access, e.g., firstName, lastName, etc.
        };
      };
      userId?: string;
    }
  }
}

// Apply CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));

// Enable JSON body parsing for incoming requests
app.use(express.json());

// Middleware to log requests (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// --- Clerk Authentication Middleware ---
// Apply authMiddleware to all routes under /api.
// authMiddleware replaces ClerkExpressRequireAuth and automatically populates req.auth
app.use('/api', clerkMiddleware ());

// Custom middleware to extract user_id from Clerk's auth object
// and potentially sync user to your database.
app.use('/api', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // authMiddleware populates req.auth with the authenticated user's data.
  // req.auth.userId will be null if the user is not authenticated.
  const userId = req.auth?.userId;

  if (!userId) {
    // This case should ideally be caught by authMiddleware,
    // but it's a good safeguard.
    res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    return;
  }

  // Attach userId to the request object for easy access in route handlers
  req.userId = userId;

  // Optional: Ensure user exists in your 'users' table
  try {
    const userExists = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userExists.rows.length === 0) {
      // Clerk's auth object directly contains email addresses
      const userEmail = req.auth?.user?.emailAddresses?.[0]?.emailAddress || `${userId}@example.com`; // Access email from req.auth.user
      await query('INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [userId, userEmail]);
      console.log(`Synced new user ${userId} to database.`);
    }
  } catch (dbErr) {
    console.error('Error syncing user to database:', dbErr);
  }

  next();
});


// Initialize routes - these routes will now be protected by Clerk auth
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

// Global error handler (should be the last middleware)
app.use(((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  // Clerk's authMiddleware can throw an error with a statusCode of 401
  if (err.statusCode === 401 && err.message === 'Unauthorized') {
    return res.status(401).json({ error: 'Authentication Required' });
  }
  res.status(err.statusCode || 500).json({
    error: err.message || 'An unexpected error occurred',
  });
}) as ErrorRequestHandler);


// Initialize database and start the server
initDb().then(() => {
  console.log('Database initialized');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
