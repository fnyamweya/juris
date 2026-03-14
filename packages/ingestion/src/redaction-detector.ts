import { RedactionCategory } from '@jusris/domain';

export interface DetectedRedaction {
  startOffset: number;
  endOffset: number;
  category: RedactionCategory;
  confidence: number;
  matchedText: string;
}

export interface RedactionDetector {
  detect(text: string): DetectedRedaction[];
}

const SSN_PATTERN = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const PII_NAME_PATTERN = /\b(?:John|Jane|Robert|Mary|James|Patricia|Michael|Jennifer|William|Linda)\s+(?:Doe|Smith|Johnson|Williams|Brown|Jones|Garcia|Miller|Davis)\b/gi;
const ADDRESS_PATTERN = /\b\d{1,6}\s+[A-Za-z\s]{3,40}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/g;
const PRIVILEGED_PATTERN = /\b(?:attorney[- ]client privilege|work product|confidential communication|privileged and confidential)\b/gi;

export const REDACTION_PATTERNS: Map<RedactionCategory, RegExp[]> = new Map([
  [RedactionCategory.PII_SSN, [SSN_PATTERN]],
  [RedactionCategory.PII_EMAIL, [EMAIL_PATTERN]],
  [RedactionCategory.PII_PHONE, [PHONE_PATTERN]],
  [RedactionCategory.PII_NAME, [PII_NAME_PATTERN]],
  [RedactionCategory.PII_ADDRESS, [ADDRESS_PATTERN]],
  [RedactionCategory.PRIVILEGED, [PRIVILEGED_PATTERN]],
]);

export function createDeterministicRedactionDetector(): RedactionDetector {
  return {
    detect(text: string): DetectedRedaction[] {
      const results: DetectedRedaction[] = [];

      for (const [category, patterns] of REDACTION_PATTERNS) {
        for (const pattern of patterns) {
          const re = new RegExp(pattern.source, pattern.flags);
          let match: RegExpExecArray | null;
          while ((match = re.exec(text)) !== null) {
            results.push({
              startOffset: match.index,
              endOffset: match.index + match[0].length,
              category,
              confidence: 1,
              matchedText: match[0],
            });
          }
        }
      }

      return results;
    },
  };
}
