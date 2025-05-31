import express, { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';

const router = express.Router();

// Get all projects for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    const result = await query('SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Failed to fetch projects:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

// Create a new project for the authenticated user
router.post('/', async (req: Request, res: Response) => {
  const { name, color, description } = req.body;
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  // Basic validation: name is mandatory
  if (!name) {
    res.status(400).json({ error: 'Project name is required.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    const result = await query(
      'INSERT INTO projects (name, color, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, color || null, description || null, userId]
    );
    res.status(201).json(result.rows[0]);
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Failed to create project:', err.message || err);
    res.status(500).json({ error: 'Failed to create project', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

// Update a project for the authenticated user
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color, description } = req.body;
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      params.push(name);
    }

    if (color !== undefined) {
      updateFields.push(`color = $${paramIndex++}`);
      params.push(color);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(description);
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
      UPDATE projects
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found or unauthorized.' }); // REMOVED 'return' before res.status(...)
      return; // Optional: Add 'return;' to exit the function on the next line
    }

    res.json(result.rows[0]);
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Failed to update project:', err.message || err);
    res.status(500).json({ error: 'Failed to update project', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

// Delete a project for the authenticated user
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId; // Get userId from the request object

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVED 'return' before res.status(...)
    return; // Optional: Add 'return;' to exit the function on the next line
  }

  try {
    const result = await query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found or unauthorized.' }); // REMOVED 'return' before res.status(...)
      return; // Optional: Add 'return;' to exit the function on the next line
    }

    res.status(204).send(); // 204 No Content for successful deletion
    return; // Optional: Add 'return;' here to ensure void return after sending response
  } catch (err: any) {
    console.error('Failed to delete project:', err.message || err);
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
    return; // Optional: Add 'return;' to exit the function on the next line
  }
});

export default router;