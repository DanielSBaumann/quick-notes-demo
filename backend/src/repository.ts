import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Note } from './types.js';
import { DatabaseError } from './errors.js';
import { randomUUID } from 'crypto';

const TABLE_NAME = process.env.NOTES_TABLE || 'quick-notes';
const endpoint = process.env.DYNAMODB_ENDPOINT;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(endpoint && { endpoint })
});

const docClient = DynamoDBDocumentClient.from(client);

export interface INotesRepository {
  save(sessionId: string, note: Omit<Note, 'sessionId'>): Promise<Note>;
  findBySessionId(sessionId: string): Promise<Note[]>;
  deleteBySessionIdAndNoteId(sessionId: string, noteId: string): Promise<void>;
}

export class NotesRepository implements INotesRepository {
  async save(sessionId: string, note: Omit<Note, 'sessionId'>): Promise<Note> {
    const fullNote: Note = { sessionId, ...note };

    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: fullNote
        })
      );
      return fullNote;
    } catch (error) {
      throw new DatabaseError(`Failed to save note: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findBySessionId(sessionId: string): Promise<Note[]> {
    try {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'sessionId = :sessionId',
          ExpressionAttributeValues: {
            ':sessionId': sessionId
          }
        })
      );
      return (result.Items as Note[]) || [];
    } catch (error) {
      throw new DatabaseError(`Failed to fetch notes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteBySessionIdAndNoteId(sessionId: string, noteId: string): Promise<void> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            sessionId,
            noteId
          }
        })
      );
    } catch (error) {
      throw new DatabaseError(`Failed to delete note: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export function createNoteId(): string {
  return randomUUID();
}
