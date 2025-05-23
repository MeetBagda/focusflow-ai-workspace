import express from 'express';
import { query } from '../lib/db';

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/', async (req, res) => {
  const { title, description, dueDate, priority, projectId } = req.body;
  try {
    const result = await query(
      'INSERT INTO tasks (title, description, due_date, priority, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, dueDate, priority, projectId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, dueDate, priority } = req.body;
  try {
    const result = await query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3, due_date = $4, priority = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, description, completed, dueDate, priority, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;