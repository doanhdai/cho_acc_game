export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  // Base static routes
  const routes = [
    '',
    '/search',
    '/top-deposit',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch active accounts for dynamic sitemap
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const res = await fetch(`${apiUrl}/accounts?limit=1000&status=SHOWING`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (res.ok) {
      const data = await res.json();
      const accounts = data.data || [];
      const accountRoutes = accounts.map((acc) => ({
        url: `${baseUrl}/accounts/${acc.id}`,
        lastModified: new Date(acc.created_at || Date.now()).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
      return [...routes, ...accountRoutes];
    }
  } catch (error) {
    console.error('Error generating sitemap for accounts:', error);
  }

  return routes;
}
