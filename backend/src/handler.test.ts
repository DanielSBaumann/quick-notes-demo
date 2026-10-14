import { test } from 'node:test';
import * as assert from 'node:assert';
import { validateNote } from './dynamodb.js';

test('validateNote: valid note', () => {
  const result = validateNote({ title: 'Test', content: 'Content' });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('validateNote: missing title', () => {
  const result = validateNote({ content: 'Content' });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length > 0, true);
});

test('validateNote: missing content', () => {
  const result = validateNote({ title: 'Test' });
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.errors.length > 0, true);
});

test('validateNote: title too long', () => {
  const result = validateNote({
    title: 'a'.repeat(101),
    content: 'Content'
  });
  assert.strictEqual(result.valid, false);
});

test('validateNote: content too long', () => {
  const result = validateNote({
    title: 'Test',
    content: 'a'.repeat(1001)
  });
  assert.strictEqual(result.valid, false);
});

test('validateNote: empty title', () => {
  const result = validateNote({ title: '   ', content: 'Content' });
  assert.strictEqual(result.valid, false);
});
