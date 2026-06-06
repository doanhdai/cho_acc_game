import AccountDetailClient from './AccountDetailClient';

export async function generateMetadata({ params }) {
  const { id } = params;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  
  try {
    const res = await fetch(`${apiUrl}/accounts/${id}`);
    if (res.ok) {
      const data = await res.json();
      const account = data.data;
      if (account) {
        let firstImage = '/banner.png';
        if (account.images) {
          try {
            const arr = Array.isArray(account.images) ? account.images : JSON.parse(account.images);
            if (arr.length > 0) firstImage = arr[0];
          } catch(e) {}
        }
        
        return {
          title: `${account.title} | Shop Acc Game`,
          description: account.description || `Mua tài khoản ${account.category_name} với giá ${account.price}đ. An toàn, uy tín.`,
          openGraph: {
            title: account.title,
            description: account.description || `Mua tài khoản ${account.category_name} với giá ${account.price}đ. An toàn, uy tín.`,
            images: [firstImage],
            url: `${baseUrl}/accounts/${id}`,
            type: 'article',
          },
          twitter: {
            card: 'summary_large_image',
            title: account.title,
            description: account.description || `Tài khoản ${account.category_name} giá tốt.`,
            images: [firstImage],
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching metadata for account:', error);
  }

  return {
    title: 'Chi Tiết Tài Khoản | Shop Acc Game',
  };
}

export default async function AccountDetailPage({ params }) {
  const { id } = params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  let account = null;
  let firstImage = '/banner.png';
  try {
    const res = await fetch(`${apiUrl}/accounts/${id}`);
    if (res.ok) {
      const data = await res.json();
      account = data.data;
      if (account && account.images) {
        try {
          const arr = Array.isArray(account.images) ? account.images : JSON.parse(account.images);
          if (arr.length > 0) firstImage = arr[0];
        } catch(e) {}
      }
    }
  } catch (error) {}

  // JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = account ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: account.title,
    image: [firstImage],
    description: account.description || `Tài khoản ${account.category_name}`,
    category: account.category_name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: account.price,
      itemCondition: 'https://schema.org/UsedCondition',
      availability: account.status === 'SHOWING' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/accounts/${id}`,
      seller: {
        '@type': 'Organization',
        name: account.seller_name || 'Shop Acc Game'
      }
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AccountDetailClient />
    </>
  );
}
