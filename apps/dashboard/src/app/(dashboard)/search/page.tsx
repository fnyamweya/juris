import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Search Workspace</h1>
        <p className="text-muted-foreground">
          Search across all matters and documents with AI-powered retrieval
        </p>
      </div>

      <div className="flex max-w-2xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ask a question or search..."
            className="h-12 pl-12 text-base"
            aria-label="AI search input"
          />
        </div>
        <Button size="lg">Search</Button>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
              <p className="text-sm text-muted-foreground">Search results will appear here</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
              <p className="text-sm text-muted-foreground">Chat panel will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Citations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">Citation display area will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
