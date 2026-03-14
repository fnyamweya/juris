import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — JUSRIS',
  description: 'Get in touch with JUSRIS. Request access or reach our team.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Contact
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Request access or get in touch. Content coming soon.
      </p>
    </div>
  );
}
