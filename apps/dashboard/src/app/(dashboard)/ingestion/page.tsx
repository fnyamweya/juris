import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function IngestionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ingestion</h1>
        <p className="text-muted-foreground">Upload and process documents for indexing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Drag and drop files here or click to upload
            </p>
            <Button className="mt-4" variant="outline">
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
