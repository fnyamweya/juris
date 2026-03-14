'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  matters: 'Matters',
  documents: 'Documents',
  search: 'Search',
  admin: 'Admin',
  users: 'Users',
  audit: 'Audit Trail',
  settings: 'Settings',
  ingestion: 'Ingestion',
};

function formatSegment(segment: string): string {
  const label = ROUTE_LABELS[segment];
  if (label !== undefined) return label;
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = [
    { href: '/', label: 'Home' },
    ...segments.map((seg, i) => {
      const href = '/' + segments.slice(0, i + 1).join('/');
      const label = formatSegment(seg);
      return { href, label };
    }),
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
