import React, { useState, useEffect } from 'react'
import { Newspaper, ExternalLink, TrendingUp, Zap } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  category: 'government' | 'investment' | 'technology' | 'market'
}

// Mock news data - In production, this would come from a news API
const mockNewsData: NewsItem[] = [
  {
    id: '1',
    title: 'Biden Administration Announces $7 Billion Investment in Solar Manufacturing',
    source: 'Reuters',
    url: '#',
    publishedAt: '2024-01-15',
    category: 'government'
  },
  {
    id: '2',
    title: 'Solar Panel Efficiency Reaches Record 47% in New Breakthrough Technology',
    source: 'PV Magazine',
    url: '#',
    publishedAt: '2024-01-14',
    category: 'technology'
  },
  {
    id: '3',
    title: 'Global Solar Investment Surpasses $300 Billion in 2024',
    source: 'Bloomberg',
    url: '#',
    publishedAt: '2024-01-13',
    category: 'investment'
  },
  {
    id: '4',
    title: 'California Extends Solar Net Metering Program Through 2030',
    source: 'Solar Power World',
    url: '#',
    publishedAt: '2024-01-12',
    category: 'government'
  },
  {
    id: '5',
    title: 'Tesla Solar Roof Tiles See 40% Cost Reduction in Manufacturing',
    source: 'Electrek',
    url: '#',
    publishedAt: '2024-01-11',
    category: 'technology'
  },
  {
    id: '6',
    title: 'IEA Predicts Solar Will Become Largest Energy Source by 2035',
    source: 'Energy News',
    url: '#',
    publishedAt: '2024-01-10',
    category: 'market'
  },
  {
    id: '7',
    title: 'European Solar Installations Hit All-Time High in Q4 2024',
    source: 'Solar Power Europe',
    url: '#',
    publishedAt: '2024-01-09',
    category: 'market'
  },
  {
    id: '8',
    title: 'New Perovskite-Silicon Tandem Cells Achieve 33% Efficiency',
    source: 'Nature Energy',
    url: '#',
    publishedAt: '2024-01-08',
    category: 'technology'
  }
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'government':
      return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    case 'investment':
      return <TrendingUp className="w-3 h-3 text-green-500" />
    case 'technology':
      return <Zap className="w-3 h-3 text-purple-500" />
    case 'market':
      return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
    default:
      return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'government':
      return 'text-blue-600 bg-blue-50'
    case 'investment':
      return 'text-green-600 bg-green-50'
    case 'technology':
      return 'text-purple-600 bg-purple-50'
    case 'market':
      return 'text-orange-600 bg-orange-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

interface SolarNewsTickerProps {
  maxItems?: number
  autoScroll?: boolean
  scrollSpeed?: number
}

export const SolarNewsTicker: React.FC<SolarNewsTickerProps> = ({
  maxItems = 8,
  autoScroll = true,
  scrollSpeed = 60 // seconds for one complete cycle
}) => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Simulate fetching news data
    setNews(mockNewsData.slice(0, maxItems))
  }, [maxItems])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Create news item component
  const NewsItemComponent = ({ item, index }: { item: NewsItem; index: number }) => (
    <div
      key={`${item.id}-${index}`}
      className="flex items-center space-x-6 px-8 py-2 whitespace-nowrap"
      style={{ minWidth: '600px' }}
    >
      <div className="flex items-center space-x-2 flex-shrink-0">
        {getCategoryIcon(item.category)}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </span>
      </div>
      <div className="flex-1 min-w-0 max-w-md">
        <p className="text-sm text-gray-900 font-medium truncate">
          {item.title}
        </p>
      </div>
      <div className="flex items-center space-x-4 text-xs text-gray-500 flex-shrink-0">
        <span className="whitespace-nowrap">{item.source}</span>
        <span className="whitespace-nowrap">{formatDate(item.publishedAt)}</span>
        <ExternalLink className="h-3 w-3" />
      </div>
    </div>
  )

  if (news.length === 0) return null

  // Create doubled array for seamless loop
  const doubledNews = [...news, ...news]

  return (
    <div className="bg-white border-t border-b border-gray-200 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Solar Energy News</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? 'Show Less' : 'View All'}
            </button>
          </div>
        </div>

        {/* News Content */}
        {isExpanded ? (
          // Expanded view - show all news items
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(item.category)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(item.publishedAt)}</span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{item.source}</span>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Continuous scrolling ticker view
          <div className="mt-2 overflow-hidden">
            <div 
              className={`flex ${autoScroll && !isPaused ? 'animate-scroll' : ''}`}
              style={{
                '--scroll-duration': `${scrollSpeed}s`,
                '--scroll-distance': `-${news.length * 600}px`
              } as React.CSSProperties}
            >
              {doubledNews.map((item, index) => (
                <NewsItemComponent key={`${item.id}-${index}`} item={item} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes scroll-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(var(--scroll-distance));
          }
        }
        
        .animate-scroll {
          animation: scroll-ticker var(--scroll-duration) linear infinite;
        }
      `}</style>
    </div>
  )
} 