import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuthStore } from '../store/authStore'
import apiService from '../services/api'
import SEO from '../components/SEO'
import type { Product, Bid, ApiResponse } from '../../../shared/types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [placingBid, setPlacingBid] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchBids()
    }
  }, [id])

  // Timer for auction countdown
  useEffect(() => {
    if (product?.isAuction && product.auctionEndDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const endTime = new Date(product.auctionEndDate!).getTime()
        const distance = endTime - now

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24))
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeLeft('Auction ended')
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      const response = await apiService.get<ApiResponse<{ product: Product }>>(`/api/products/${id}`)
      setProduct(response.data?.product!)
    } catch (error) {
      toast.error('Failed to load product')
      navigate('/search')
    } finally {
      setLoading(false)
    }
  }

  const fetchBids = async () => {
    try {
      const response = await apiService.get<ApiResponse<{ bids: Bid[] }>>(`/api/products/${id}/bids`)
      setBids(response.data?.bids || [])
    } catch (error) {
      console.error('Failed to load bids:', error)
    }
  }

  const handleBid = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid')
      navigate('/login')
      return
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount')
      return
    }

    const amount = parseFloat(bidAmount)
    const minimumBid = product?.currentBid ? product.currentBid + 1 : product?.minimumBid || 0

    if (amount < minimumBid) {
      toast.error(`Minimum bid is $${minimumBid}`)
      return
    }

    setPlacingBid(true)
    try {
      await apiService.post(`/api/products/${id}/bids`, { amount })
      toast.success('Bid placed successfully!')
      setBidAmount('')
      fetchProduct()
      fetchBids()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place bid')
    } finally {
      setPlacingBid(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to buy this product')
      navigate('/login')
      return
    }

    try {
      await apiService.post(`/api/orders`, {
        productId: id,
        totalAmount: product?.buyNowPrice || product?.price
      })
      toast.success('Order placed successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    }
  }

  const sendMessage = () => {
    if (!isAuthenticated) {
      toast.error('Please login to send a message')
      navigate('/login')
      return
    }
    navigate(`/dashboard/messages?productId=${id}&sellerId=${product?.ownerId}`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-300 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/search')}
            className="mt-4 btn btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  const isAuctionActive = product.isAuction && product.auctionEndDate && new Date(product.auctionEndDate) > new Date()
  const minimumBid = product.currentBid ? product.currentBid + 1 : product.minimumBid || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title={product?.title}
        description={product?.description || `${product?.title} - ${product?.isAuction ? 'Auction' : 'Buy Now'} on VoltBay solar marketplace`}
        keywords={`${product?.title}, ${product?.category?.name}, solar equipment, ${product?.isAuction ? 'solar auction' : 'buy solar'}, renewable energy`}
        image={product?.imageUrls?.[0]}
        url={window.location.href}
        type={product?.isAuction ? 'auction' : 'product'}
        price={product?.isAuction ? product?.currentBid || product?.minimumBid : product?.price}
        availability={product?.isAuction ? 'auction' : 'in stock'}
        category={product?.category?.name}
        condition={product?.condition}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded overflow-hidden ${
                    index === selectedImage ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={url}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{product.category?.name}</p>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            {product.isAuction ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Current Bid:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${product.currentBid || product.minimumBid || 0}
                  </span>
                </div>
                
                {isAuctionActive && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time left:</span>
                      <span className="text-lg font-semibold text-orange-600">{timeLeft}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Minimum bid:</span>
                      <span className="text-lg font-semibold">${minimumBid}</span>
                    </div>
                  </>
                )}

                {product.buyNowPrice && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Buy Now Price:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.buyNowPrice}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Price:</span>
                <span className="text-3xl font-bold text-green-600">${product.price}</span>
              </div>
            )}
          </div>

          {/* Condition */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Condition:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
              {product.condition.replace('_', ' ')}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {product.isAuction && isAuctionActive && user?.id !== product.ownerId && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min: $${minimumBid}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={minimumBid}
                    step="0.01"
                  />
                  <button
                    onClick={handleBid}
                    disabled={placingBid}
                    className="btn btn-primary px-6"
                  >
                    {placingBid ? 'Placing...' : 'Place Bid'}
                  </button>
                </div>
              </div>
            )}

            {((product.buyNowPrice && product.isAuction) || !product.isAuction) && 
             user?.id !== product.ownerId && (
              <button
                onClick={handleBuyNow}
                className="w-full btn btn-primary"
              >
                Buy Now - ${product.buyNowPrice || product.price}
              </button>
            )}

            {user?.id !== product.ownerId && (
              <button
                onClick={sendMessage}
                className="w-full btn btn-outline"
              >
                Message Seller
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 gap-2">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between">
                      <dt className="font-medium text-gray-700">{spec.name}:</dt>
                      <dd className="text-gray-900">
                        {spec.value} {spec.unit && <span className="text-gray-500">{spec.unit}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Seller Info */}
          {product.owner && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Seller</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {product.owner.avatar ? (
                    <img 
                      src={product.owner.avatar} 
                      alt={product.owner.firstName} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {product.owner.firstName?.[0] || product.owner.email[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {product.owner.firstName} {product.owner.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(product.owner.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bidding History */}
      {product.isAuction && bids.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Bidding History</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {bids.map((bid) => (
                <div key={bid.id} className="px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {bid.user?.firstName?.[0] || bid.user?.email[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">
                      {bid.user?.firstName || 'Anonymous'}
                    </span>
                    {bid.isWinning && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Winning
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">${bid.amount}</span>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 