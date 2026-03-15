import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — JUSRIS',
  description: 'JUSRIS pricing plans and enterprise options.',
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Pricing</h1>
      <p className="mt-4 text-lg text-slate-600">
        Plans and pricing for teams of all sizes. Content coming soon.
      </p>
    </div>
  );
}
