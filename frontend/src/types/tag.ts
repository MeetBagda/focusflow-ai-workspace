export interface Tag {
  id: number; // SERIAL PRIMARY KEY in DB
  user_id: string; // Clerk's user ID, linking tag to its owner
  name: string;
  color?: string | null; // Optional color for the tag
  created_at: string; // ISO 8601 string
}

/**
 * @fileoverview Defines the TaskTag interface, reflecting the 'task_tags' junction table.
 * This table links tasks to tags.
 */
export interface TaskTag {
  task_id: number; // Foreign key to tasks table
  tag_id: number; // Foreign key to tags table
}