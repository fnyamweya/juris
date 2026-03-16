import { describe, it, expect } from 'vitest';

import { createSemanticChunker } from '../chunker.js';

describe('createSemanticChunker', () => {
  const chunker = createSemanticChunker();

  it('chunks by paragraph boundaries', () => {
    const text = `First paragraph here.

Second paragraph with more content.

Third paragraph.`;
    const chunks = chunker.chunk(text, {
      maxTokens: 100,
      overlapTokens: 0,
      preserveStructure: true,
    });
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0]?.content).toContain('First paragraph');
  });

  it('applies overlap between chunks', () => {
    const text = 'Para one. Para two. Para three. Para four. Para five.';
    const chunks = chunker.chunk(text, {
      maxTokens: 15,
      overlapTokens: 5,
      preserveStructure: false,
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it('respects max token limit', () => {
    const longText = 'word '.repeat(200);
    const chunks = chunker.chunk(longText, {
      maxTokens: 50,
      overlapTokens: 5,
      preserveStructure: false,
    });
    for (const chunk of chunks) {
      const approxTokens = Math.ceil(chunk.content.length / 4);
      expect(approxTokens).toBeLessThanOrEqual(60);
    }
  });

  it('returns empty array for empty input', () => {
    const chunks = chunker.chunk('', {
      maxTokens: 100,
      overlapTokens: 0,
      preserveStructure: true,
    });
    expect(chunks).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    const chunks = chunker.chunk('   \n\n   ', {
      maxTokens: 100,
      overlapTokens: 0,
      preserveStructure: true,
    });
    expect(chunks).toEqual([]);
  });
});
