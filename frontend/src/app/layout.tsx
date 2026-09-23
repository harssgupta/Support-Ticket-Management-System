import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Support Ticket Hub',
  description: 'Manage support tickets efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
