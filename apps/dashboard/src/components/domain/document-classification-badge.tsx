import { DocumentClassification } from '@juris/domain';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CLASSIFICATION_VARIANTS: Record<
  DocumentClassification,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  [DocumentClassification.PUBLIC]: 'outline',
  [DocumentClassification.INTERNAL]: 'secondary',
  [DocumentClassification.CONFIDENTIAL]: 'warning',
  [DocumentClassification.PRIVILEGED]: 'destructive',
  [DocumentClassification.RESTRICTED]: 'destructive',
};

const CLASSIFICATION_LABELS: Record<DocumentClassification, string> = {
  [DocumentClassification.PUBLIC]: 'Public',
  [DocumentClassification.INTERNAL]: 'Internal',
  [DocumentClassification.CONFIDENTIAL]: 'Confidential',
  [DocumentClassification.PRIVILEGED]: 'Privileged',
  [DocumentClassification.RESTRICTED]: 'Restricted',
};

export function DocumentClassificationBadge({
  classification,
  className,
}: {
  classification: DocumentClassification;
  className?: string;
}) {
  return (
    <Badge
      variant={CLASSIFICATION_VARIANTS[classification]}
      className={cn(className)}
      aria-label={`Classification: ${CLASSIFICATION_LABELS[classification]}`}
    >
      {CLASSIFICATION_LABELS[classification]}
    </Badge>
  );
}
