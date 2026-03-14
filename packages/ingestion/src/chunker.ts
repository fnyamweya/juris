export interface ChunkingOptions {
  maxTokens: number;
  overlapTokens: number;
  preserveStructure: boolean;
}

export interface DocumentChunkInput {
  content: string;
  chunkIndex: number;
  pageNumber?: number;
  anchorRef?: string;
}

export interface ChunkingStrategy {
  chunk(text: string, options: ChunkingOptions): DocumentChunkInput[];
}

const AVG_CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

function splitIntoParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return paragraphs.length > 0 ? paragraphs : [trimmed];
}

export function createSemanticChunker(): ChunkingStrategy {
  return {
    chunk(text: string, options: ChunkingOptions): DocumentChunkInput[] {
      const { maxTokens, overlapTokens, preserveStructure } = options;

      if (!text.trim()) {
        return [];
      }

      const chunks: DocumentChunkInput[] = [];
      let chunkIndex = 0;

      if (preserveStructure) {
        const paragraphs = splitIntoParagraphs(text);
        let currentChunk = '';
        let currentTokens = 0;

        for (const para of paragraphs) {
          const paraTokens = estimateTokens(para);

          if (currentTokens + paraTokens > maxTokens && currentChunk) {
            chunks.push({
              content: currentChunk.trim(),
              chunkIndex: chunkIndex++,
            });

            if (overlapTokens > 0) {
              const words = currentChunk.split(/\s+/);
              const overlapChars = overlapTokens * AVG_CHARS_PER_TOKEN;
              let overlapText = '';
              let overlapLen = 0;
              for (let i = words.length - 1; i >= 0 && overlapLen < overlapChars; i--) {
                const word = words[i];
                if (word === undefined) break;
                overlapText = word + (overlapText ? ' ' + overlapText : '');
                overlapLen += word.length + 1;
              }
              currentChunk = overlapText;
              currentTokens = estimateTokens(overlapText);
            } else {
              currentChunk = '';
              currentTokens = 0;
            }
          }

          currentChunk += (currentChunk ? '\n\n' : '') + para;
          currentTokens += paraTokens;
        }

        if (currentChunk.trim()) {
          chunks.push({
            content: currentChunk.trim(),
            chunkIndex: chunkIndex++,
          });
        }
      } else {
        const words = text.split(/\s+/).filter(Boolean);
        let start = 0;

        while (start < words.length) {
          let end = start;
          let tokenCount = 0;

          while (end < words.length && tokenCount < maxTokens) {
            const word = words[end];
            tokenCount += word !== undefined ? estimateTokens(word) || 1 : 1;
            end++;
          }

          const content = words.slice(start, end).join(' ');
          if (content.trim()) {
            chunks.push({
              content: content.trim(),
              chunkIndex: chunkIndex++,
            });
          }

          const overlapWords = Math.max(0, overlapTokens);
          start = Math.max(start + 1, end - overlapWords);
        }
      }

      return chunks;
    },
  };
}
