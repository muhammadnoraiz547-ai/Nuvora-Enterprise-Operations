import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AppProviders from '@/components/AppProviders';
import '../index.css';

export const metadata: Metadata = {
  title: 'Operations Flow',
  description: 'Operations Flow - Enterprise Business Operations & Management platform.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}