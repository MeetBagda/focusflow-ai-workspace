export interface Project {
  id: number; // SERIAL PRIMARY KEY in DB, usually a number
  user_id: string; // Clerk's user ID, linking project to its owner
  name: string;
  color?: string | null; // Optional color for the project
  description?: string | null; // Optional description
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
}

export interface ProjectWithTaskCount extends Project {
  taskCount: number;
}