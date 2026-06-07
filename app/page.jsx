import HomePageClient from './HomePageClient';

export const metadata = {
  title: 'Trang Chủ - Shop Acc Game Liên Quân, Free Fire, Valorant',
  description: 'Trang chủ Shop Acc Game uy tín. Mua bán tài khoản Liên Quân, Free Fire, Valorant giá rẻ, an toàn, giao dịch tự động 24/7.',
  keywords: ['mua acc liên quân', 'shop acc', 'tài khoản game', 'shop acc game'],
  openGraph: {
    title: 'Trang Chủ - Shop Acc Game',
    description: 'Mua bán tài khoản game an toàn, tự động 24/7. Hỗ trợ nhiều game đa dạng.',
  }
};

export default function HomePage() {
  return <HomePageClient />;
}
