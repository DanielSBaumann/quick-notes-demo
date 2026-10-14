import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNote, getNotes, deleteNote } from './api';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create a note', async () => {
    window.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            noteId: '123',
            title: 'Test',
            content: 'Content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sessionId: 'test'
          }
        })
      } as Response)
    );

    const note = await createNote({ title: 'Test', content: 'Content' });
    expect(note.title).toBe('Test');
    expect(note.content).toBe('Content');
  });

  it('should get notes', async () => {
    window.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            {
              noteId: '1',
              title: 'Note 1',
              content: 'Content 1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              sessionId: 'test'
            }
          ]
        })
      } as Response)
    );

    const notes = await getNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Note 1');
  });

  it('should delete a note', async () => {
    window.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response)
    );

    await deleteNote('123');
    expect(fetch).toHaveBeenCalled();
  });

  it('should throw on API error', async () => {
    window.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' })
      } as Response)
    );

    await expect(createNote({ title: 'Test', content: 'Content' })).rejects.toThrow();
  });

});
