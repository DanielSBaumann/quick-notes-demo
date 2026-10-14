import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createNote, getNotes, deleteNote } from './api';
import './App.css';
export default function App() {
    const [notes, setNotes] = useState([]);
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notes');
        }
    };
    const handleSubmit = async (e) => {
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
            const request = { title, content };
            const newNote = await createNote(request);
            setNotes([newNote, ...notes]);
            setTitle('');
            setContent('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create note');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (noteId) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }
        try {
            setError('');
            await deleteNote(noteId);
            setNotes(notes.filter(n => n.noteId !== noteId));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete note');
        }
    };
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "Quick Notes" }), _jsx("p", { children: "Simple, fast note-taking" })] }), _jsxs("main", { className: "app-main", children: [_jsxs("section", { className: "form-section", children: [_jsxs("form", { onSubmit: handleSubmit, className: "note-form", children: [_jsx("input", { type: "text", placeholder: "Note title...", value: title, onChange: (e) => setTitle(e.target.value), maxLength: 100, disabled: loading, className: "form-input form-title" }), _jsxs("span", { className: "char-count", children: [title.length, "/100"] }), _jsx("textarea", { placeholder: "Note content...", value: content, onChange: (e) => setContent(e.target.value), maxLength: 1000, disabled: loading, className: "form-input form-content" }), _jsxs("span", { className: "char-count", children: [content.length, "/1000"] }), _jsx("button", { type: "submit", disabled: loading || !title.trim() || !content.trim(), className: "submit-btn", children: loading ? 'Creating...' : 'Create Note' })] }), error && _jsx("div", { className: "error-message", children: error })] }), _jsxs("section", { className: "notes-section", children: [_jsxs("h2", { children: ["Your Notes (", notes.length, ")"] }), notes.length === 0 ? (_jsx("p", { className: "empty-message", children: "No notes yet. Create one above!" })) : (_jsx("div", { className: "notes-list", children: notes.map((note) => (_jsxs("div", { className: "note-card", children: [_jsxs("div", { className: "note-header", children: [_jsx("h3", { children: note.title }), _jsx("button", { onClick: () => handleDelete(note.noteId), className: "delete-btn", title: "Delete note", children: "\u2715" })] }), _jsx("p", { className: "note-content", children: note.content }), _jsx("div", { className: "note-footer", children: _jsxs("time", { dateTime: note.createdAt, children: [new Date(note.createdAt).toLocaleDateString(), ' ', new Date(note.createdAt).toLocaleTimeString()] }) })] }, note.noteId))) }))] })] })] }));
}
//# sourceMappingURL=App.js.map