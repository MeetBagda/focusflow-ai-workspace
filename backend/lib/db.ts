import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Be cautious with rejectUnauthorized: false in production.
                              // It's often used for local development with self-signed certs.
                              // For production, ensure you have proper SSL certificate validation.
  }
});

export const query = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params);
  return result;
};

// Initialize tables with user_id for data isolation
export const initDb = async () => {
  await query(`
    -- Create a users table if you want to store additional user-specific data
    -- beyond what Clerk provides. The 'id' here would be the Clerk user ID.
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY, -- Stores Clerk's user ID (e.g., 'user_2d3k4l5j6h')
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      -- Add other user-specific fields here (e.g., subscription_plan, preferences)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Link to users table
      name VARCHAR(255) NOT NULL,
      color VARCHAR(50),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Link to users table
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      dueDate TIMESTAMP,
      priority VARCHAR(50),
      reminder TIMESTAMP,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurrence_pattern VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Link to users table
      title VARCHAR(255) NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id SERIAL PRIMARY KEY,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP,
      duration INTEGER,
      session_type VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Changed to VARCHAR(255) and linked to users
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Tags should also be user-specific
      name VARCHAR(50) NOT NULL,
      color VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS task_tags (
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, tag_id)
    );

    -- Add indexes for performance on user_id columns
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks (user_id);
    CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes (user_id);
    CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions (user_id);
    CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags (user_id);
  `);
};
