import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spread Studio',
  description: 'Deterministic multi-leg options strategy builder',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
