import type { Metadata } from 'next';
import { NEON_FONTS_STYLESHEET } from '@neon-adda/shared';
import { Inter, Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-sora' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Partner portal | Neon Adda', template: '%s | Neon Adda Partner' },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${sora.variable} ${inter.variable}`}>
      <head>
        {/* Signs without a picture are drawn from their lettering, in its neon typeface. */}
        <link rel="stylesheet" href={NEON_FONTS_STYLESHEET} />
      </head>
      <body>{children}</body>
    </html>
  );
}
