import Link from 'next/link';

const features = [
  {
    title: 'Tenant Isolation',
    description:
      'Strict data separation between organizations. Your documents and AI models never mix with other tenants.',
  },
  {
    title: 'Document Intelligence',
    description:
      'Parse, classify, and extract insights from contracts, briefs, and legal documents at scale.',
  },
  {
    title: 'AI-Powered Search',
    description:
      'Semantic search across your legal corpus. Find relevant precedent and clauses in seconds.',
  },
  {
    title: 'Audit & Compliance',
    description:
      'Complete audit trails for every action. Meet regulatory requirements with immutable logs.',
  },
  {
    title: 'Role-Based Access',
    description:
      'Fine-grained permissions aligned to your organization. Control who sees and edits what.',
  },
  {
    title: 'Custom Domains',
    description:
      'Deploy under your own domain. White-label the experience for your clients and teams.',
  },
];

const industries = [
  {
    name: 'Law Firms',
    description: 'Secure matter management, research acceleration, and client document handling.',
  },
  {
    name: 'Corporate Legal',
    description: 'Contract lifecycle, compliance workflows, and in-house team collaboration.',
  },
  {
    name: 'Government',
    description: 'FOIA, litigation support, and agency-wide legal knowledge management.',
  },
  {
    name: 'Forensics',
    description: 'E-discovery, chain-of-custody, and defensible AI-assisted review.',
  },
];

const securityPoints = [
  'Encryption at rest and in transit (AES-256, TLS 1.3)',
  'Hard tenant isolation with dedicated namespaces',
  'Immutable audit trails for every document and query',
  'SOC 2 and GDPR-ready architecture',
  'No training on your data — your content stays yours',
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Enterprise Legal AI Platform
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Secure, multi-tenant legal AI for law firms, corporate legal teams, and government
              agencies. Document intelligence, semantic search, and compliance built in.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="w-full rounded-md bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 sm:w-auto"
              >
                Request Access
              </Link>
              <Link
                href="/features"
                className="w-full rounded-md border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built for enterprise
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to deploy legal AI at scale, with security and compliance at the
              core.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Trusted across industries
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From law firms to government agencies, JUSRIS adapts to your workflows and compliance
              requirements.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {industries.map((industry) => (
              <div key={industry.name} className="rounded-xl border border-slate-200 bg-white p-8">
                <h3 className="text-lg font-semibold text-slate-900">{industry.name}</h3>
                <p className="mt-3 text-sm text-slate-600">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Enterprise-Grade Security
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Security is not an afterthought. Every layer of JUSRIS is designed for the most
                sensitive legal workloads.
              </p>
            </div>
            <div>
              <ul className="space-y-4">
                {securityPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-slate-700">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
