import { describe, it, expect } from 'vitest';
import { assemblePrompt } from '../prompt-assembly.js';
import type { RetrievedChunk } from '../retrieval-orchestrator.js';

function makeChunk(id: string, content: string, score = 0.9): RetrievedChunk {
  return {
    chunkId: id,
    documentId: 'doc-1',
    documentTitle: 'Test Document',
    content,
    score,
  };
}

describe('assemblePrompt', () => {
  it('assembles basic prompt with chunks', () => {
    const chunks: RetrievedChunk[] = [
      makeChunk('c1', 'First chunk content'),
      makeChunk('c2', 'Second chunk content'),
    ];
    const result = assemblePrompt({
      systemPrompt: 'You are a legal assistant.',
      retrievedChunks: chunks,
      userQuery: 'What does the document say?',
      maxContextTokens: 2000,
    });

    expect(result.messages.length).toBeGreaterThanOrEqual(2);
    expect(result.messages[0]?.role).toBe('system');
    expect(result.messages[0]?.content).toContain('First chunk content');
    expect(result.messages[0]?.content).toContain('Second chunk content');
    expect(result.includedChunkIds).toContain('c1');
    expect(result.includedChunkIds).toContain('c2');
    expect(result.truncated).toBe(false);
  });

  it('truncates when context exceeds limit', () => {
    const longContent = 'x'.repeat(5000);
    const chunks: RetrievedChunk[] = [
      makeChunk('c1', longContent),
      makeChunk('c2', longContent),
      makeChunk('c3', longContent),
    ];
    const result = assemblePrompt({
      systemPrompt: 'Assistant.',
      retrievedChunks: chunks,
      userQuery: 'Query',
      maxContextTokens: 500,
    });

    expect(result.includedChunkIds.length).toBeLessThan(chunks.length);
    expect(result.truncated).toBe(true);
  });

  it('includes chat history correctly', () => {
    const result = assemblePrompt({
      systemPrompt: 'You are helpful.',
      retrievedChunks: [],
      userQuery: 'Follow-up question',
      chatHistory: [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First answer' },
      ],
      maxContextTokens: 2000,
    });

    expect(result.messages.length).toBeGreaterThanOrEqual(3);
    const roles = result.messages.map((m) => m.role);
    expect(roles).toContain('user');
    expect(roles).toContain('assistant');
  });

  it('produces valid prompt with empty chunks', () => {
    const result = assemblePrompt({
      systemPrompt: 'You are a legal assistant.',
      retrievedChunks: [],
      userQuery: 'What is the law?',
      maxContextTokens: 2000,
    });

    expect(result.messages.length).toBeGreaterThanOrEqual(2);
    expect(result.messages[0]?.role).toBe('system');
    expect(result.messages[0]?.content).toContain('You are a legal assistant');
    expect(result.includedChunkIds).toEqual([]);
    expect(result.truncated).toBe(false);
  });
});
