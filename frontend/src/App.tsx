import { useState, useEffect } from 'react';
import { Note, CreateNoteRequest } from './types';
import { createNote, getNotes, deleteNote } from './api';
import './App.css';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setError('');
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (title.length > 100) {
      setError('Title must be 100 characters or less');
      return;
    }

    if (content.length > 1000) {
      setError('Content must be 1000 characters or less');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const request: CreateNoteRequest = { title, content };
      const newNote = await createNote(request);
      setNotes([newNote, ...notes]);
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setError('');
      await deleteNote(noteId);
      setNotes(notes.filter(n => n.noteId !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quick Notes</h1>
        <p>Simple, fast note-taking</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <form onSubmit={handleSubmit} className="note-form">
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={loading}
              className="form-input form-title"
            />
            <span className="char-count">{title.length}/100</span>

            <textarea
              placeholder="Note content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              disabled={loading}
              className="form-input form-content"
            />
            <span className="char-count">{content.length}/1000</span>

            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="submit-btn"
            >
              {loading ? 'Creating...' : 'Create Note'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
        </section>

        <section className="notes-section">
          <h2>Your Notes ({notes.length})</h2>
          {notes.length === 0 ? (
            <p className="empty-message">No notes yet. Create one above!</p>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div key={note.noteId} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <button
                      onClick={() => handleDelete(note.noteId)}
                      className="delete-btn"
                      title="Delete note"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="note-content">{note.content}</p>
                  <div className="note-footer">
                    <time dateTime={note.createdAt}>
                      {new Date(note.createdAt).toLocaleDateString()}
                      {' '}
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
