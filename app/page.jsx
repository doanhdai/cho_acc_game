import HomePageClient from './HomePageClient';

export const metadata = {
  title: 'Trang Chủ - Shop Acc Liên Quân Mobile Uy Tín',
  description: 'Trang chủ Shop bán tài khoản Liên Quân Mobile giá rẻ, an toàn, hỗ trợ giao dịch tự động 24/7.',
  keywords: ['mua acc liên quân', 'shop acc liên quân', 'acc liên quân giá rẻ', 'chợ acc liên quân'],
  openGraph: {
    title: 'Trang Chủ - Shop Acc Liên Quân',
    description: 'Mua bán tài khoản Liên Quân Mobile an toàn, tự động 24/7.',
  }
};

export default function HomePage() {
  return <HomePageClient />;
}
