import express, { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

const router = express.Router();

// Get all tasks
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
const createTask = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, due_date, priority, project_id, is_recurring, completed } = req.body;

  // Basic validation: title is mandatory
  if (!title) {
    res.status(400).json({ error: 'Title is required to create a task' });
    return;
  }

  try {
    // Check if project_id exists if provided
    if (project_id !== null && project_id !== undefined) {
      const projectExists = await query('SELECT id FROM projects WHERE id = $1', [project_id]);
      
      if (projectExists.rows.length === 0) {
        res.status(400).json({ 
          error: `Project with ID ${project_id} does not exist. Cannot assign task to non-existent project.` 
        });
        return;
      }
    }

    const result = await query(
      'INSERT INTO tasks (title, description, due_date, priority, project_id, is_recurring, completed) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        title,
        description || null,
        due_date || null,
        priority || 'medium',
        project_id === 0 ? null : project_id, // Convert 0 to null since 0 is not a valid ID
        is_recurring || false,
        completed || false
      ]
    );

    console.log('Created task:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating task:', err.message || err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
};

router.post('/', createTask);

// Update task
const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, description, completed, due_date, priority, project_id, is_recurring } = req.body;
  
  try {
    // Check if project_id exists if provided
    if (project_id !== null && project_id !== undefined) {
      const projectExists = await query('SELECT id FROM projects WHERE id = $1', [project_id]);
      
      if (projectExists.rows.length === 0) {
        res.status(400).json({ 
          error: `Project with ID ${project_id} does not exist. Cannot assign task to non-existent project.` 
        });
        return;
      }
    }

    // Build the query dynamically based on provided fields
    let updateFields = [];
    let params = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    
    if (completed !== undefined) {
      updateFields.push(`completed = $${paramIndex++}`);
      params.push(completed);
    }
    
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramIndex++}`);
      params.push(due_date);
    }
    
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }
    
    if (project_id !== undefined) {
      updateFields.push(`project_id = $${paramIndex++}`);
      params.push(project_id === 0 ? null : project_id); // Convert 0 to null
    }
    
    if (is_recurring !== undefined) {
      updateFields.push(`is_recurring = $${paramIndex++}`);
      params.push(is_recurring);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add the ID as the last parameter
    params.push(id);
    
    const updateQuery = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await query(updateQuery, params);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating task:', err.message || err);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
};

router.put('/:id', updateTask);

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