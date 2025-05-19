
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  projectId?: string;
  priority: 'high' | 'medium' | 'low' | null;
  isRecurring: boolean;
  reminder?: {
    date: string;
    time: string;
    notified: boolean;
  } | null;
}