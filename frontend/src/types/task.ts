export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  priority: string;
  is_recurring: boolean;
  project_id: number | null;
  reminder: string | null;
  recurrence_pattern: string | null;
  created_at: string;
  updated_at: string;
}