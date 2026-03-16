import { Users, CreditCard, Globe } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground">Manage tenant settings, users, and billing</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">
              View users →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing
            </CardTitle>
            <CardDescription>Subscription and usage billing</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-muted-foreground">Coming soon</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Custom Domain
            </CardTitle>
            <CardDescription>Configure custom domain for your tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-muted-foreground">Coming soon</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Settings</CardTitle>
          <CardDescription>Organization-wide configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">Tenant settings will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
