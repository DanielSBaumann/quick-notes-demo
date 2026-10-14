import express, { Request, Response, NextFunction } from 'express';
import { NotesService } from './service.js';
import { NotesRepository } from './repository.js';
import { ApplicationError } from './errors.js';

const app = express();
app.use(express.json());

const repository = new NotesRepository();
const service = new NotesService(repository);

function getSessionId(req: Request): string {
  return (req.headers['x-session-id'] as string) || `session-${Date.now()}`;
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const note = await service.createNote(sessionId, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
});

app.get('/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    const notes = await service.getNotes(sessionId);
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
});

app.delete('/notes/:noteId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { noteId } = req.params;
    const sessionId = getSessionId(req);
    await service.deleteNote(sessionId, noteId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApplicationError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };
