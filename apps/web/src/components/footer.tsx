import Link from 'next/link';

const productLinks = [
  { href: '/features', label: 'Features' },
  { href: '/security', label: 'Security' },
  { href: '/pricing', label: 'Pricing' },
];

const companyLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/contact', label: 'Request Access' },
];

const legalLinks = [
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms of Service' },
];

const statusLinks = [{ href: '/contact', label: 'Status' }];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Status
            </h3>
            <ul className="mt-4 space-y-3">
              {statusLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-center text-sm text-slate-500">
            © {currentYear} JUSRIS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
