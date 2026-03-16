import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security — Juris',
  description:
    'Enterprise-grade security posture: encryption, tenant isolation, audit trails, and compliance.',
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Security</h1>
      <p className="mt-4 text-lg text-slate-600">
        Our security posture, certifications, and compliance framework. Content coming soon.
      </p>
    </div>
  );
}
