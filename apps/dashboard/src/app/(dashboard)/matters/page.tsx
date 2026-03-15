import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

export default function MattersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Matters</h1>
        <Button asChild>
          <Link href="/matters/new">
            <Plus className="h-4 w-4" />
            New Matter
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search matters..." className="pl-9" aria-label="Search matters" />
        </div>
        <div className="flex gap-2">
          <Input placeholder="Status" className="w-32" aria-label="Filter by status" />
          <Input placeholder="Type" className="w-32" aria-label="Filter by type" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">Matters table will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
