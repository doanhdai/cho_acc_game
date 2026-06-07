export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

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
