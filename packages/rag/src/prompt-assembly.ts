import type { RetrievedChunk } from './retrieval-orchestrator.js';

const AVG_CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

export interface AssemblePromptParams {
  systemPrompt: string;
  retrievedChunks: RetrievedChunk[];
  userQuery: string;
  chatHistory?: { role: string; content: string }[];
  maxContextTokens: number;
}

export interface AssembledPrompt {
  messages: { role: string; content: string }[];
  includedChunkIds: string[];
  truncated: boolean;
}

export function assemblePrompt(params: AssemblePromptParams): AssembledPrompt {
  const { systemPrompt, retrievedChunks, userQuery, chatHistory = [], maxContextTokens } = params;

  const includedChunkIds: string[] = [];
  let usedTokens = estimateTokens(systemPrompt);
  const contextParts: string[] = [];

  for (const chunk of retrievedChunks) {
    const chunkTokens = estimateTokens(chunk.content);
    const chunkHeader = `[${chunk.chunkId}] (${chunk.documentTitle}${chunk.pageNumber != null ? ` p.${chunk.pageNumber}` : ''}):`;
    const headerTokens = estimateTokens(chunkHeader);

    if (usedTokens + headerTokens + chunkTokens > maxContextTokens) {
      break;
    }

    contextParts.push(`${chunkHeader}\n${chunk.content}`);
    includedChunkIds.push(chunk.chunkId);
    usedTokens += headerTokens + chunkTokens;
  }

  const truncated = includedChunkIds.length < retrievedChunks.length;

  const contextBlock =
    contextParts.length > 0 ? `\n\n## Retrieved Context\n\n${contextParts.join('\n\n')}` : '';

  const systemContent = systemPrompt + contextBlock;

  const maxHistoryTokens = Math.floor(maxContextTokens * 0.2);
  const historyMessages: { role: string; content: string }[] = [];
  let historyTokens = 0;

  for (let i = chatHistory.length - 1; i >= 0 && historyTokens < maxHistoryTokens; i--) {
    const msg = chatHistory[i];
    if (msg === undefined) continue;
    const msgTokens = estimateTokens(msg.content);
    if (historyTokens + msgTokens > maxHistoryTokens) break;
    historyMessages.unshift(msg);
    historyTokens += msgTokens;
  }

  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemContent },
    ...historyMessages,
    { role: 'user', content: userQuery },
  ];

  return {
    messages,
    includedChunkIds,
    truncated,
  };
}
