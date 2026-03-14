import Link from 'next/link';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/security', label: 'Security' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-slate-900 hover:text-brand-600 transition-colors"
        >
          JUSRIS
        </Link>

        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Request Access
          </Link>

          <div className="relative md:hidden">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
                <span>Menu</span>
                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="absolute right-4 top-full mt-2 w-48 rounded-md border border-slate-200 bg-white py-2 shadow-lg">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      </nav>
    </header>
  );
}
