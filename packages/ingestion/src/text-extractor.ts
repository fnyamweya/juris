export interface ExtractionInput {
  content: ArrayBuffer;
  mimeType: string;
  filename?: string;
}

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  text: string;
  pages?: PageContent[];
  metadata: Record<string, string>;
}

export interface TextExtractor {
  extract(input: ExtractionInput): Promise<ExtractionResult>;
}

export function createTextExtractor(): TextExtractor {
  return {
    async extract(input: ExtractionInput): Promise<ExtractionResult> {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(input.content);
      return {
        text: text.trim() || '(no text extracted)',
        metadata: {
          mimeType: input.mimeType,
          filename: input.filename ?? '(unknown)',
        },
      };
    },
  };
}
