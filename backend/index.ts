import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'; // Import authMiddleware from @clerk/express
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
      // The `auth` property is now a function that returns the auth object.
      // We'll adjust the usage below, but for type declaration,
      // it's often better to rely on Clerk's types like `LooseAuthProp`
      // or define a custom type if you're only accessing specific properties.
      // For now, let's simplify the declaration to reflect the function call.
      // Clerk's `clerkMiddleware` should handle extending Request correctly internally.
      // If you're still seeing type errors, you might need to import `AuthObject` from Clerk
      // and define `auth: () => AuthObject | null`.
      // For simplicity and to match the deprecation warning, we'll assume `req.auth()` returns the object.
      auth: { // This declaration is for the *return type* of req.auth()
        userId: string | null;
        sessionId: string | null;
        orgId: string | null;
        user?: { // Make it optional, as it might not always be present or fully populated
          emailAddresses?: Array<{
            emailAddress: string;
          }>;
        };
      } | (() => { // This is the change: it can be the object directly (old) or a function (new)
        userId: string | null;
        sessionId: string | null;
        orgId: string | null;
        user?: {
          emailAddresses?: Array<{
            emailAddress: string;
          }>;
        };
      } | null); // The function can return null if not authenticated
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

// --- Public Routes (Place BEFORE Clerk Middleware) ---
// Basic health check route - accessible without authentication
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

// --- Clerk Authentication Middleware ---
// Apply authMiddleware to all routes under /api.
// Changed '/api/*' to '/api' to resolve 'Missing parameter name' error.
app.use('/api', clerkMiddleware());

// Custom middleware to extract user_id from Clerk's auth object
// and potentially sync user to your database.
// Changed '/api/*' to '/api' to resolve 'Missing parameter name' error.
app.use('/api', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // FIX: Use req.auth() as a function to get the auth object
  const authObject = typeof req.auth === 'function' ? req.auth() : req.auth;
  const userId = authObject?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    return;
  }

  req.userId = userId;

  try {
    const userExists = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userExists.rows.length === 0) {
      // FIX: Access email from the authObject returned by req.auth()
      const userEmail = authObject?.user?.emailAddresses?.[0]?.emailAddress || `${userId}@example.com`;
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


// Global error handler (should be the last middleware)
app.use(((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
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
