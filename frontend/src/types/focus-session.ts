export interface FocusSession {
  id: number; // SERIAL PRIMARY KEY in DB
  start_time: string; // ISO 8601 string for TIMESTAMP NOT NULL
  end_time?: string | null; // ISO 8601 string for TIMESTAMP
  duration?: number | null; // Duration in minutes/seconds
  session_type?: string | null; // e.g., 'pomodoro', 'deep_work'
  notes?: string | null;
  created_at: string; // ISO 8601 string
  user_id: string; // Clerk's user ID, linking session to its owner (now VARCHAR)
  task_id?: number | null; // Foreign key to tasks table
}