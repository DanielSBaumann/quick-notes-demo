const API_BASE = '/api';
function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}
export async function createNote(request) {
    const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': getSessionId()
        },
        body: JSON.stringify(request)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create note');
    }
    const result = await response.json();
    return result.data;
}
export async function getNotes() {
    const response = await fetch(`${API_BASE}/notes`, {
        headers: {
            'X-Session-Id': getSessionId()
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }
    const result = await response.json();
    return result.data || [];
}
export async function deleteNote(noteId) {
    const response = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
            'X-Session-Id': getSessionId()
        }
    });
    if (!response.ok) {
        throw new Error('Failed to delete note');
    }
}
//# sourceMappingURL=api.js.map