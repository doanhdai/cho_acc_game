import SearchClient from './SearchClient';

export const metadata = {
  title: 'Tìm Kiếm Tài Khoản Liên Quân Mobile | Shop Acc Liên Quân',
  description: 'Tìm kiếm hàng ngàn tài khoản game Liên Quân Mobile với mức giá tốt nhất. Bộ lọc thông minh theo Rank, Tướng, Skin.',
  keywords: ['tìm acc liên quân', 'mua acc liên quân', 'lọc acc liên quân', 'tài khoản liên quân giá rẻ'],
  openGraph: {
    title: 'Tìm Kiếm Tài Khoản Liên Quân | Shop Acc Liên Quân',
    description: 'Tìm kiếm tài khoản Liên Quân Mobile dễ dàng với bộ lọc thông minh.',
  }
};

export default function SearchPage() {
  return <SearchClient />;
}
