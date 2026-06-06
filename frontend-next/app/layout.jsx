import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ClientHeaderFooter from '@/components/layout/ClientHeaderFooter';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Shop Acc Game';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  title: {
    default: `${SITE_NAME} - Sàn Giao Dịch Acc Game Uy Tín`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Sàn giao dịch tài khoản game uy tín số 1 Việt Nam. Mua bán acc Liên Quân, LOL, PUBG và nhiều game khác. Cam kết chất lượng, hỗ trợ 24/7.',
  keywords: ['mua bán acc game', 'shop acc liên quân', 'acc game giá rẻ', 'mua acc liên quân', 'shop acc uy tín'],
  authors: [{ name: 'Shop Acc Game Admin' }],
  creator: 'Shop Acc Game',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Sàn Giao Dịch Acc Game Uy Tín`,
    description: 'Sàn giao dịch tài khoản game uy tín số 1 Việt Nam. Mua bán acc Liên Quân, LOL, PUBG và nhiều game khác.',
    images: ['/banner.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Sàn Giao Dịch Acc Game Uy Tín`,
    description: 'Sàn giao dịch tài khoản game uy tín số 1 Việt Nam.',
    images: ['/banner.png'],
  },
  alternates: {
    canonical: '/',
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
          <Toaster
            position="top-right"
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
