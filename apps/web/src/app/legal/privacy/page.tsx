import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — JUSRIS',
  description: 'JUSRIS privacy policy and data handling practices.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-slate-600">Privacy policy placeholder. Content coming soon.</p>
    </div>
  );
}
