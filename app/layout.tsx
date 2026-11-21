import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ลอยกระทงออนไลน์ มทร.กรุงเทพ | สระน้ำแห่งคำอธิษฐาน',
  description:
    'ร่วมสืบสานประเพณีลอยกระทงออนไลน์ มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ (RMUTK) ณ สระน้ำแห่งคำอธิษฐาน ร่วมเขียนคำอธิษฐาน จุดประทีป และเสี่ยงทายเซียมซี',
  keywords: [
    'ลอยกระทง',
    'ลอยกระทงออนไลน์',
    'มทร.กรุงเทพ',
    'RMUTK',
    'สระน้ำแห่งคำอธิษฐาน',
    'ราชมงคลกรุงเทพ',
    'เซียมซี',
  ],
  authors: [{ name: 'Rajamangala University of Technology Krungthep' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'ลอยกระทงออนไลน์ มทร.กรุงเทพ | สระน้ำแห่งคำอธิษฐาน',
    description: 'ร่วมลอยกระทงออนไลน์ ณ สระน้ำ มทร.กรุงเทพ เขียนคำอธิษฐานและเสี่ยงทายเซียมซี',
    type: 'website',
    locale: 'th_TH',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A1224',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark scroll-smooth">
      <body className="min-h-screen bg-rmutk-midnight text-rmutk-ivory antialiased selection:bg-rmutk-gold selection:text-rmutk-midnight">
        {children}
      </body>
    </html>
  );
}
