import { MatterStatus } from '@juris/domain';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_VARIANTS: Record<
  MatterStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  [MatterStatus.DRAFT]: 'secondary',
  [MatterStatus.OPEN]: 'default',
  [MatterStatus.ACTIVE]: 'success',
  [MatterStatus.ON_HOLD]: 'warning',
  [MatterStatus.CLOSED]: 'outline',
  [MatterStatus.ARCHIVED]: 'secondary',
};

const STATUS_LABELS: Record<MatterStatus, string> = {
  [MatterStatus.DRAFT]: 'Draft',
  [MatterStatus.OPEN]: 'Open',
  [MatterStatus.ACTIVE]: 'Active',
  [MatterStatus.ON_HOLD]: 'On Hold',
  [MatterStatus.CLOSED]: 'Closed',
  [MatterStatus.ARCHIVED]: 'Archived',
};

export function MatterStatusBadge({
  status,
  className,
}: {
  status: MatterStatus;
  className?: string;
}) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      className={cn(className)}
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
