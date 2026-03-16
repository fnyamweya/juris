'use client';

import {
  Home,
  Briefcase,
  FileText,
  Search,
  UploadCloud,
  ShieldCheck,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/matters', label: 'Matters', icon: Briefcase },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/search', label: 'Search & AI', icon: Search },
  { href: '/ingestion', label: 'Ingestion', icon: UploadCloud },
  { href: '/audit', label: 'Audit Trail', icon: ShieldCheck },
  { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },
];

export function DashboardSidebar({ isAdmin = true }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-sidebar-foreground/10 bg-[hsl(222,47%,8%)] text-[hsl(210,40%,98%)] transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
      aria-label="Dashboard navigation"
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="font-semibold tracking-tight">
            JUSRIS
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-white hover:bg-white/10"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2" role="navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/80 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <Separator className="bg-white/20" />
    </aside>
  );
}
