import { CreateNoteRequest, Note } from './types.js';
import { INotesRepository, createNoteId } from './repository.js';
import { ValidationError } from './errors.js';

export interface INotesService {
  createNote(sessionId: string, request: CreateNoteRequest): Promise<Note>;
  getNotes(sessionId: string): Promise<Note[]>;
  deleteNote(sessionId: string, noteId: string): Promise<void>;
}

export class NotesService implements INotesService {
  constructor(private repository: INotesRepository) {}

  async createNote(sessionId: string, request: CreateNoteRequest): Promise<Note> {
    const validation = this.validateCreateRequest(request);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join('; '));
    }

    const now = new Date().toISOString();
    const note: Omit<Note, 'sessionId'> = {
      noteId: createNoteId(),
      title: request.title.trim(),
      content: request.content.trim(),
      createdAt: now,
      updatedAt: now
    };

    return this.repository.save(sessionId, note);
  }

  async getNotes(sessionId: string): Promise<Note[]> {
    return this.repository.findBySessionId(sessionId);
  }

  async deleteNote(sessionId: string, noteId: string): Promise<void> {
    return this.repository.deleteBySessionIdAndNoteId(sessionId, noteId);
  }

  private validateCreateRequest(data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Request body must be an object'] };
    }

    const req = data as Record<string, unknown>;

    if (!req.title || typeof req.title !== 'string' || req.title.trim().length === 0) {
      errors.push('title is required and must be a non-empty string');
    } else if ((req.title as string).length > 100) {
      errors.push('title must be 100 characters or less');
    }

    if (!req.content || typeof req.content !== 'string' || req.content.trim().length === 0) {
      errors.push('content is required and must be a non-empty string');
    } else if ((req.content as string).length > 1000) {
      errors.push('content must be 1000 characters or less');
    }

    return { valid: errors.length === 0, errors };
  }
}
