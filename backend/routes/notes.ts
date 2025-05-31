import express, { Request, Response, NextFunction } from 'express'; // Import Request, Response, NextFunction
import { query } from '../lib/db';

const router = express.Router();

// Removed: interface AuthenticatedRequest extends Request { userId?: string; }
// The Request interface is now globally extended in index.ts to include userId.

// Get all notes for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVE 'return'
    return; // Optional: Add 'return;' to exit the function
  }

  try {
    const result = await query('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Failed to fetch notes:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch notes', details: err.message });
  }
});

// Create a new note for the authenticated user
router.post('/', async (req: Request, res: Response) => {
  const { title, content, project_id } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVE 'return'
    return; // Optional: Add 'return;' to exit the function
  }

  if (!title) {
    res.status(400).json({ error: 'Title is required to create a note.' }); // REMOVE 'return'
    return; // Optional: Add 'return;' to exit the function
  }

  try {
    if (project_id !== null && project_id !== undefined) {
      const projectExists = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [project_id, userId]);
      if (projectExists.rows.length === 0) {
        res.status(400).json({ // REMOVE 'return'
          error: `Project with ID ${project_id} does not exist or does not belong to the current user. Cannot assign note to non-existent or unauthorized project.`,
        });
        return; // Optional: Add 'return;' to exit the function
      }
    }

    const result = await query(
      'INSERT INTO notes (title, content, project_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content || null, project_id || null, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Failed to create note:', err.message || err);
    res.status(500).json({ error: 'Failed to create note', details: err.message });
  }
});

// Update a note for the authenticated user
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, project_id } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVE 'return'
    return; // Optional: Add 'return;' to exit the function
  }

  try {
    if (project_id !== null && project_id !== undefined) {
      const projectExists = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [project_id, userId]);
      if (projectExists.rows.length === 0) {
        res.status(400).json({ // REMOVE 'return'
          error: `Project with ID ${project_id} does not exist or does not belong to the current user.`,
        });
        return; // Optional: Add 'return;' to exit the function
      }
    }

    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      params.push(title);
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      params.push(content);
    }

    if (project_id !== undefined) {
      updateFields.push(`project_id = $${paramIndex++}`);
      params.push(project_id || null);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 1 && updateFields[0].includes('updated_at')) {
      res.status(400).json({ error: 'No valid fields provided for update.' }); // REMOVE 'return'
      return; // Optional: Add 'return;' to exit the function
    }

    params.push(id);
    params.push(userId);

    const updateQuery = `
      UPDATE notes
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Note not found or unauthorized.' }); // REMOVE 'return'
      return; // Optional: Add 'return;' to exit the function
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Failed to update note:', err.message || err);
    res.status(500).json({ error: 'Failed to update note', details: err.message });
  }
});

// Delete a note for the authenticated user
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: User ID not found.' }); // REMOVE 'return'
    return; // Optional: Add 'return;' to exit the function
  }

  try {
    const result = await query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Note not found or unauthorized.' }); // REMOVE 'return'
      return; // Optional: Add 'return;' to exit the function
    }

    res.status(204).send();
  } catch (err: any) {
    console.error('Failed to delete note:', err.message || err);
    res.status(500).json({ error: 'Failed to delete note', details: err.message });
  }
});

export default router;
