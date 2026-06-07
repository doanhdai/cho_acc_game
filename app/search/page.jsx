import SearchClient from './SearchClient';

export const metadata = {
  title: 'Tìm Kiếm Tài Khoản Game | Shop Acc Game',
  description: 'Tìm kiếm hàng ngàn tài khoản game Liên Quân, Free Fire, Valorant với mức giá tốt nhất. Bộ lọc thông minh theo Rank, Tướng, Skin.',
  keywords: ['tìm acc game', 'mua acc liên quân', 'lọc acc game', 'tài khoản giá rẻ'],
  openGraph: {
    title: 'Tìm Kiếm Tài Khoản Game | Shop Acc Game',
    description: 'Tìm kiếm tài khoản game dễ dàng với bộ lọc thông minh.',
  }
};

export default function SearchPage() {
  return <SearchClient />;
}
