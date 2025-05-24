import express, { Request, Response, RequestHandler } from 'express';
import { query } from '../lib/db';

const router = express.Router();

// Get all tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
const createTask: RequestHandler = async (req, res) => {
  const { title, description, dueDate, priority, projectId } = req.body;

  // Basic validation: title is mandatory
  if (!title) {
    res.status(400).json({ error: 'Title is required to create a task' });
    return;
  }

  // Define default values for optional fields if they are not provided
  // Ensure these defaults match your database column types
  const finalDescription = description !== undefined ? description : null;
  const finalDueDate = dueDate !== undefined ? dueDate : null; // or new Date().toISOString() for a default date
  const finalPriority = priority !== undefined ? priority : 'medium'; // Example: default to 'medium'
  const finalProjectId = projectId !== undefined ? projectId : null;

   try {
     const result = await query(
      'INSERT INTO tasks (title, description, due_date, priority, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        title,
        description || null,
        dueDate || null,
        priority || 'medium',
        projectId // Don't use || null here as 0 could be falsy
      ]
    );

    // Log for debugging
    console.log('Created task:', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (err: any) { // Type the error for better handling if needed
    console.error('Error creating task:', err.message || err);
    // You can inspect err.code or err.detail for more specific DB errors
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
};

router.post('/', createTask);

// Update task
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, completed, dueDate, priority } = req.body;
  try {
    const result = await query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3, dueDate = $4, priority = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, description, completed, dueDate, priority, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;