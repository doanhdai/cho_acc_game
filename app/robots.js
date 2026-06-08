export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://choaccgame.store';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/search', '/accounts/*', '/top-deposit'],
      disallow: [
        '/admin',
        '/admin/*',
        '/profile',
        '/history',
        '/orders',
        '/orders/*',
        '/sell',
        '/deposit',
        '/my-accounts',
        '/login',
        '/register'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
