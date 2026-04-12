import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TalentOS — Webknot',
  description: 'AI-Powered Recruitment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
