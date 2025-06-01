export interface Task {
  id: number; // SERIAL PRIMARY KEY in DB
  user_id: string; // Clerk's user ID, linking task to its owner
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: string | null; // ISO 8601 string for TIMESTAMP
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Example priorities
  reminder?: string | null; // ISO 8601 string for TIMESTAMP
  is_recurring: boolean;
  recurrence_pattern?: string | null; // e.g., "daily", "weekly", "monthly", "custom_json"
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
  project_id?: number | null; // Foreign key to projects table
}