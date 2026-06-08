import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ClientHeaderFooter from '@/components/layout/ClientHeaderFooter';
import { Analytics } from '@vercel/analytics/react';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Shop Acc Game';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://choaccgame.store'),
  title: {
    default: `${SITE_NAME} - Sàn Mua Bán Acc Liên Quân Uy Tín`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Sàn giao dịch mua bán tài khoản Liên Quân Mobile uy tín số 1 Việt Nam. Cam kết chất lượng, an toàn, hỗ trợ 24/7.',
  keywords: ['mua bán acc liên quân', 'shop acc liên quân', 'acc liên quân giá rẻ', 'mua acc liên quân uy tín', 'chợ acc liên quân'],
  authors: [{ name: 'Shop Acc Liên Quân Admin' }],
  creator: 'Shop Acc Liên Quân',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Sàn Mua Bán Acc Liên Quân Uy Tín`,
    description: 'Sàn giao dịch mua bán tài khoản Liên Quân Mobile uy tín số 1 Việt Nam. Cam kết chất lượng, an toàn, hỗ trợ 24/7.',
    images: ['/banner.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Sàn Mua Bán Acc Liên Quân Uy Tín`,
    description: 'Sàn giao dịch mua bán tài khoản Liên Quân Mobile uy tín số 1 Việt Nam.',
    images: ['/banner.png'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/logo_lienquan.png',
    shortcut: '/logo_lienquan.png',
    apple: '/logo_lienquan.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ClientHeaderFooter>
            {children}
          </ClientHeaderFooter>
          <Analytics />
          <Toaster
            position="top-right"
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
              style: { background: 'var(--bg-card2)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
              success: { iconTheme: { primary: 'var(--success)', secondary: 'white' } },
              error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
