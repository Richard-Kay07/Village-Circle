import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'VillageCircle360',
  description: 'UK group savings and loan circle management',
  icons: {
    icon: '/brand/logo/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
