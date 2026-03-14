import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'JUSRIS — Enterprise Legal AI Platform',
  description:
    'Secure, multi-tenant legal AI platform for law firms, corporate legal teams, and government agencies. Document intelligence, AI-powered search, and enterprise-grade compliance.',
  openGraph: {
    title: 'JUSRIS — Enterprise Legal AI Platform',
    description:
      'Secure, multi-tenant legal AI platform for law firms, corporate legal teams, and government agencies.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
