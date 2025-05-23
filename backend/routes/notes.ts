import express from 'express';
import { query } from '../lib/db';

const router = express.Router();

// Get all notes
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', async (req, res) => {
  const { title, content, projectId } = req.body;
  try {
    const result = await query(
      'INSERT INTO notes (title, content, project_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, projectId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, projectId } = req.body;
  try {
    const result = await query(
      'UPDATE notes SET title = $1, content = $2, project_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, content, projectId, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM notes WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;