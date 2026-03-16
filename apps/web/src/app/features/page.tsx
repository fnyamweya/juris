import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features — Juris',
  description:
    'Explore Juris features: tenant isolation, document intelligence, AI-powered search, audit trails, and more.',
};

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Features</h1>
      <p className="mt-4 text-lg text-slate-600">
        Detailed feature documentation and capabilities. Content coming soon.
      </p>
    </div>
  );
}
