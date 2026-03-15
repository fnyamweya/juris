import { describe, it, expect } from 'vitest';
import { createDeterministicRedactionDetector } from '../redaction-detector.js';
import { RedactionCategory } from '@jusris/domain';

describe('createDeterministicRedactionDetector', () => {
  const detector = createDeterministicRedactionDetector();

  it('detects SSN pattern XXX-XX-XXXX', () => {
    const text = 'The claimant SSN is 123-45-6789 for verification.';
    const results = detector.detect(text);
    expect(results).toHaveLength(1);
    expect(results[0]?.category).toBe(RedactionCategory.PII_SSN);
    expect(results[0]?.matchedText).toBe('123-45-6789');
    expect(results[0]?.confidence).toBe(1);
  });

  it('detects SSN without dashes', () => {
    const text = 'SSN: 987654321';
    const results = detector.detect(text);
    expect(results).toHaveLength(1);
    expect(results[0]?.matchedText).toBe('987654321');
  });

  it('detects email addresses', () => {
    const text = 'Contact counsel at john.doe@lawfirm.com for details.';
    const results = detector.detect(text);
    expect(results).toHaveLength(1);
    expect(results[0]?.category).toBe(RedactionCategory.PII_EMAIL);
    expect(results[0]?.matchedText).toBe('john.doe@lawfirm.com');
  });

  it('detects phone numbers', () => {
    const text = 'Call (555) 123-4567 or 555-987-6543 for assistance.';
    const results = detector.detect(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const phones = results.filter((r) => r.category === RedactionCategory.PII_PHONE);
    expect(phones.some((p) => p.matchedText.includes('123-4567'))).toBe(true);
  });

  it('avoids false positives on normal legal text', () => {
    const text =
      'Pursuant to Section 123 of the Code, the court held that the defendant shall pay damages.';
    const results = detector.detect(text);
    const ssnResults = results.filter((r) => r.category === RedactionCategory.PII_SSN);
    const emailResults = results.filter((r) => r.category === RedactionCategory.PII_EMAIL);
    expect(ssnResults).toHaveLength(0);
    expect(emailResults).toHaveLength(0);
  });
});
