import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'auction'
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock' | 'auction'
  category?: string
  brand?: string
  condition?: string
  noIndex?: boolean
  canonical?: string
}

const defaultSEO = {
  title: 'VoltBay - Solar Products Marketplace',
  description: 'The world\'s largest marketplace for solar products. Buy, sell, and auction solar panels, inverters, batteries, and complete systems. Find the best deals on renewable energy equipment.',
  keywords: 'solar panels, solar inverters, solar batteries, renewable energy, solar marketplace, solar equipment, photovoltaic, solar auction, clean energy',
  image: '/images/voltbay-og-image.jpg',
  url: 'https://voltbay.com',
  type: 'website' as const
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  price,
  currency = 'USD',
  availability,
  category,
  brand,
  condition,
  noIndex = false,
  canonical
}: SEOProps) {
  const seoTitle = title 
    ? `${title} | VoltBay` 
    : defaultSEO.title
  
  const seoDescription = description || defaultSEO.description
  const seoKeywords = keywords || defaultSEO.keywords
  const seoImage = image || defaultSEO.image
  const seoUrl = url || defaultSEO.url
  
  // Ensure absolute URL for image
  const absoluteImage = seoImage.startsWith('http') 
    ? seoImage 
    : `${window.location.origin}${seoImage}`

  // Generate structured data based on type
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'product' || type === 'auction' ? 'Product' : 'WebPage',
      "name": title || defaultSEO.title,
      "description": seoDescription,
      "url": seoUrl,
      "image": absoluteImage
    }

    if (type === 'product' || type === 'auction') {
      return {
        ...baseData,
        "@type": "Product",
        "brand": brand ? { "@type": "Brand", "name": brand } : undefined,
        "category": category,
        "condition": condition,
        "offers": price ? {
          "@type": type === 'auction' ? "AggregateOffer" : "Offer",
          "price": price,
          "priceCurrency": currency,
          "availability": `https://schema.org/${availability === 'in stock' ? 'InStock' : availability === 'out of stock' ? 'OutOfStock' : 'LimitedAvailability'}`,
          "seller": {
            "@type": "Organization",
            "name": "VoltBay"
          }
        } : undefined
      }
    }

    return baseData
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content="VoltBay" />
      
      {/* Product-specific Open Graph */}
      {(type === 'product' || type === 'auction') && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability || 'in stock'} />
          {category && <meta property="product:category" content={category} />}
          {condition && <meta property="product:condition" content={condition} />}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@VoltBay" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={absoluteImage} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="VoltBay" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData(), null, 2)}
      </script>
    </Helmet>
  )
} 