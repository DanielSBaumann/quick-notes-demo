import { Note, CreateNoteRequest } from './types';
export declare function createNote(request: CreateNoteRequest): Promise<Note>;
export declare function getNotes(): Promise<Note[]>;
export declare function deleteNote(noteId: string): Promise<void>;
//# sourceMappingURL=api.d.ts.map