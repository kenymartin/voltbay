interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export const generateSitemap = (urls: SitemapUrl[]): string => {
  const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'https://voltbay.com'
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`

  return sitemapXml
}

export const getStaticSitemapUrls = (): SitemapUrl[] => {
  return [
    {
      loc: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      loc: '/products',
      changefreq: 'hourly',
      priority: 0.9,
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      loc: '/auctions',
      changefreq: 'hourly',
      priority: 0.9,
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      loc: '/search',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      loc: '/categories',
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString().split('T')[0]
    }
  ]
}

export const getDynamicSitemapUrls = async (): Promise<SitemapUrl[]> => {
  try {
    // This would be called by a server-side script or API endpoint
    const response = await fetch('/api/sitemap/products')
    const products = await response.json()
    
    return products.map((product: any) => ({
      loc: `/products/${product.id}`,
      changefreq: 'weekly' as const,
      priority: 0.6,
      lastmod: product.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0]
    }))
  } catch (error) {
    console.error('Failed to fetch dynamic sitemap URLs:', error)
    return []
  }
} 