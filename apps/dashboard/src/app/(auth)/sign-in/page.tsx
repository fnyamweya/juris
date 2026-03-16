import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mb-4 flex justify-center">
          <span className="text-2xl font-bold tracking-tight text-primary">JUSRIS</span>
        </div>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Enter your organization slug and email to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="org-slug"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Organization / Tenant
          </label>
          <Input
            id="org-slug"
            type="text"
            placeholder="your-org"
            aria-label="Organization or tenant slug for realm discovery"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email
          </label>
          <Input id="email" type="email" placeholder="you@example.com" aria-label="Email address" />
        </div>
        <Button className="w-full">Continue with SSO</Button>
        <p className="text-center text-xs text-muted-foreground">
          <Link
            href="https://jusris.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Back to public site
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
