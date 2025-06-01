export interface Note {
  id: number; // SERIAL PRIMARY KEY in DB
  user_id: string; // Clerk's user ID, linking note to its owner
  title: string;
  content?: string | null;
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
  project_id?: number | null; // Foreign key to projects table
}