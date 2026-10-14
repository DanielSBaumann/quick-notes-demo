import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Note, CreateNoteRequest } from './types.js';
import { randomUUID } from 'crypto';

const TABLE_NAME = process.env.NOTES_TABLE || 'quick-notes';
const endpoint = process.env.DYNAMODB_ENDPOINT;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(endpoint && { endpoint })
});

const docClient = DynamoDBDocumentClient.from(client);

export async function createNote(sessionId: string, request: CreateNoteRequest): Promise<Note> {
  const now = new Date().toISOString();
  const noteId = randomUUID();

  const note: Note = {
    sessionId,
    noteId,
    title: request.title,
    content: request.content,
    createdAt: now,
    updatedAt: now
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: note
    })
  );

  return note;
}

export async function getNotes(sessionId: string): Promise<Note[]> {
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
}

export async function deleteNote(sessionId: string, noteId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        sessionId,
        noteId
      }
    })
  );
}

export function validateNote(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const req = data as Record<string, unknown>;

  if (!req.title || typeof req.title !== 'string' || req.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }

  if ((req.title as string)?.length > 100) {
    errors.push('title must be 100 characters or less');
  }

  if (!req.content || typeof req.content !== 'string' || req.content.trim().length === 0) {
    errors.push('content is required and must be a non-empty string');
  }

  if ((req.content as string)?.length > 1000) {
    errors.push('content must be 1000 characters or less');
  }

  return { valid: errors.length === 0, errors };
}
