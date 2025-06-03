import express, { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    const result = await query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Failed to fetch tasks:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

// Create a new task for the authenticated user
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, dueDate, priority, project_id, is_recurring, completed } = req.body;
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  // Basic validation: title is mandatory
  if (!title) {
    res.status(400).json({ error: 'Title is required to create a task.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    // Validate if project_id exists and belongs to the same user if provided
    if (project_id !== null && project_id !== undefined) {
      const projectExists = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [project_id, userId]);

      if (projectExists.rows.length === 0) {
        res.status(400).json({ // REMOVED 'return' before res.status(...)
          error: `Project with ID ${project_id} does not exist or does not belong to the current user. Cannot assign task to non-existent or unauthorized project.`,
        });
        return; // Optional: Add 'return;' to exit the function on the next line
      }
    }

    const result = await query(
      'INSERT INTO tasks (title, description, dueDate, priority, project_id, is_recurring, completed, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        title,
        description || null,
        dueDate || null,
        priority || 'medium',
        project_id === 0 ? null : project_id, // Convert 0 to null since 0 is not a valid ID
        is_recurring || false,
        completed || false,
        userId // Insert the user ID
      ]
    );

    console.log('Created task:', result.rows[0]);
    res.status(201).json(result.rows[0]);
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Error creating task:', err.message || err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

// Update a task for the authenticated user
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, description, completed, dueDate, priority, project_id, is_recurring } = req.body;
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    // Validate if project_id exists and belongs to the same user if provided
    if (project_id !== null && project_id !== undefined) {
      const projectExists = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [project_id, userId]);

      if (projectExists.rows.length === 0) {
        res.status(400).json({ // REMOVED 'return' before res.status(...)
          error: `Project with ID ${project_id} does not exist or does not belong to the current user.`,
        });
        return; // Optional: Add 'return;' to exit the function on the next line
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

    if (dueDate !== undefined) {
      updateFields.push(`dueDate = $${paramIndex++}`);
      params.push(dueDate);
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

    // Ensure there are fields to update other than updated_at
    if (updateFields.length === 1 && updateFields[0].includes('updated_at')) {
      res.status(400).json({ error: 'No valid fields provided for update.' }); // REMOVED 'return' before res.status(...)
      return; // Optional: Add 'return;' to exit the function on the next line
    }

    // Add the ID and userId as the last parameters for WHERE clause
    params.push(id);
    params.push(userId);

    const updateQuery = `
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized.' }); // REMOVED 'return' before res.status(...)
      return; // Optional: Add 'return;' to exit the function on the next line
    }

    res.json(result.rows[0]);
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Error updating task:', err.message || err);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

// Delete a task for the authenticated user
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    const result = await query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized.' }); // REMOVED 'return' before res.status(...)
      return; // Optional: Add 'return;' to exit the function on the next line
    }

    res.status(204).send(); // 204 No Content for successful deletion
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Failed to delete task:', err.message || err);
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

export default router;