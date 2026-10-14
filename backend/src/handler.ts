import express, { Request, Response } from 'express';
import { createNote, getNotes, deleteNote, validateNote } from './dynamodb.js';

const app = express();
app.use(express.json());

function getSessionId(req: Request): string {
  return req.headers['x-session-id'] as string || 'default-session';
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/notes', async (req: Request, res: Response) => {
  try {
    const validation = validateNote(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.errors.join('; ') });
    }

    const sessionId = getSessionId(req);
    const note = await createNote(sessionId, req.body);

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/notes', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    const notes = await getNotes(sessionId);

    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/notes/:noteId', async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const sessionId = getSessionId(req);

    await deleteNote(sessionId, noteId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };
