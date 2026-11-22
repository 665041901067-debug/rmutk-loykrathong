import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://rmutk-loykrathong.vercel.app'),
  title: 'ลอยกระทงออนไลน์ มทร.กรุงเทพ | สระน้ำแห่งคำอธิษฐาน',
  description:
    'ร่วมสืบสานประเพณีลอยกระทงออนไลน์ มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ (RMUTK) ณ สระน้ำแห่งคำอธิษฐาน ร่วมเขียนคำอธิษฐาน จุดประทีป ปล่อยโคมลอย โยนเหรียญบ่อเต่าแก้เคล็ด และเสี่ยงทายเซียมซี',
  keywords: [
    'ลอยกระทง',
    'ลอยกระทงออนไลน์',
    'มทร.กรุงเทพ',
    'RMUTK',
    'สระน้ำแห่งคำอธิษฐาน',
    'ราชมงคลกรุงเทพ',
    'บ่อเต่าแก้เคล็ด',
    'ปล่อยโคมลอย',
    'เซียมซี',
    'ลอยกระทง 2569',
  ],
  authors: [{ name: 'มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ (RMUTK)' }],
  alternates: {
    canonical: 'https://rmutk-loykrathong.vercel.app',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'ลอยกระทงออนไลน์ มทร.กรุงเทพ',
    description: 'ร่วมลอยกระทงออนไลน์ ณ สระน้ำ มทร.กรุงเทพ เขียนคำอธิษฐาน จุดประทีป ปล่อยโคมลอย และลอยกับเพื่อนแบบเรียลไทม์',
    url: 'https://rmutk-loykrathong.vercel.app',
    siteName: 'ลอยกระทงออนไลน์ มทร.กรุงเทพ',
    type: 'website',
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ลอยกระทงออนไลน์ มทร.กรุงเทพ',
    description: 'ร่วมลอยกระทงออนไลน์ ณ สระน้ำ มทร.กรุงเทพ เขียนคำอธิษฐาน จุดประทีป ปล่อยโคมลอย และลอยกับเพื่อนแบบเรียลไทม์',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ลอยกระทงออนไลน์ มทร.กรุงเทพ',
    url: 'https://rmutk-loykrathong.vercel.app',
    description:
      'ร่วมสืบสานประเพณีลอยกระทงออนไลน์ มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ ณ สระน้ำแห่งคำอธิษฐาน',
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'All',
    creator: {
      '@type': 'EducationalOrganization',
      name: 'มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ (RMUTK)',
      url: 'https://www.rmutk.ac.th',
    },
  };

  return (
    <html lang="th" prefix="og: https://ogp.me/ns# fb: https://ogp.me/ns/fb#" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-rmutk-midnight text-rmutk-ivory antialiased selection:bg-rmutk-gold selection:text-rmutk-midnight">
        {children}
      </body>
    </html>
  );
}
