import { test } from 'node:test';
import * as assert from 'node:assert';
import { NotesService } from './service.js';
import { CreateNoteRequest, Note } from './types.js';
import { ValidationError } from './errors.js';

class MockNotesRepository {
  notes: Map<string, Note[]> = new Map();

  async save(sessionId: string, note: Omit<Note, 'sessionId'>): Promise<Note> {
    const fullNote: Note = { sessionId, ...note };
    const sessionNotes = this.notes.get(sessionId) || [];
    sessionNotes.push(fullNote);
    this.notes.set(sessionId, sessionNotes);
    return fullNote;
  }

  async findBySessionId(sessionId: string): Promise<Note[]> {
    return this.notes.get(sessionId) || [];
  }

  async deleteBySessionIdAndNoteId(sessionId: string, noteId: string): Promise<void> {
    const sessionNotes = this.notes.get(sessionId) || [];
    const filtered = sessionNotes.filter(n => n.noteId !== noteId);
    this.notes.set(sessionId, filtered);
  }
}

test('NotesService: create valid note', async () => {
  const repository = new MockNotesRepository();
  const service = new NotesService(repository);

  const request: CreateNoteRequest = { title: 'Test', content: 'Content' };
  const note = await service.createNote('session-1', request);

  assert.strictEqual(note.title, 'Test');
  assert.strictEqual(note.content, 'Content');
  assert.strictEqual(note.sessionId, 'session-1');
});

test('NotesService: reject empty title', async () => {
  const repository = new MockNotesRepository();
  const service = new NotesService(repository);

  const request: CreateNoteRequest = { title: '', content: 'Content' };

  try {
    await service.createNote('session-1', request);
    assert.fail('Should have thrown ValidationError');
  } catch (error) {
    assert.ok(error instanceof ValidationError);
  }
});

test('NotesService: reject empty content', async () => {
  const repository = new MockNotesRepository();
  const service = new NotesService(repository);

  const request: CreateNoteRequest = { title: 'Test', content: '' };

  try {
    await service.createNote('session-1', request);
    assert.fail('Should have thrown ValidationError');
  } catch (error) {
    assert.ok(error instanceof ValidationError);
  }
});

test('NotesService: reject title too long', async () => {
  const repository = new MockNotesRepository();
  const service = new NotesService(repository);

  const request: CreateNoteRequest = { title: 'a'.repeat(101), content: 'Content' };

  try {
    await service.createNote('session-1', request);
    assert.fail('Should have thrown ValidationError');
  } catch (error) {
    assert.ok(error instanceof ValidationError);
  }
});

test('NotesService: reject content too long', async () => {
  const repository = new MockNotesRepository();
  const service = new NotesService(repository);

  const request: CreateNoteRequest = { title: 'Test', content: 'a'.repeat(1001) };

  try {
    await service.createNote('session-1', request);
    assert.fail('Should have thrown ValidationError');
  } catch (error) {
    assert.ok(error instanceof ValidationError);
  }
});

test('NotesService: get notes by session', async () => {
  const repository = new MockNotesRepository();
  const service = new NotesService(repository);

  await service.createNote('session-1', { title: 'Note 1', content: 'Content 1' });
  await service.createNote('session-1', { title: 'Note 2', content: 'Content 2' });

  const notes = await service.getNotes('session-1');
  assert.strictEqual(notes.length, 2);
  assert.strictEqual(notes[0].title, 'Note 1');
  assert.strictEqual(notes[1].title, 'Note 2');
});

test('NotesService: delete note', async () => {
  const repository = new MockNotesRepository();
  const service = new NotesService(repository);

  const note = await service.createNote('session-1', { title: 'Test', content: 'Content' });
  const noteId = note.noteId;

  let notes = await service.getNotes('session-1');
  assert.strictEqual(notes.length, 1);

  await service.deleteNote('session-1', noteId);

  notes = await service.getNotes('session-1');
  assert.strictEqual(notes.length, 0);
});
