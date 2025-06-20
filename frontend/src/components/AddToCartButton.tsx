import { useState } from 'react'
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { toast } from 'react-toastify'
import type { Product } from '@shared/dist'

interface AddToCartButtonProps {
  product: Product
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showQuantitySelector?: boolean
  className?: string
}

export default function AddToCartButton({
  product,
  variant = 'primary',
  size = 'md',
  showQuantitySelector = false,
  className = ''
}: AddToCartButtonProps) {
  const { addToCart, isInCart, getItemQuantity, updateQuantity, openCart } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const isProductInCart = isInCart(product.id)
  const currentQuantity = getItemQuantity(product.id)

  const handleAddToCart = async () => {
    if (product.isAuction) {
      toast.error('Auction items cannot be added to cart. Place a bid instead.')
      return
    }

    setIsAdding(true)
    
    try {
      addToCart(product, quantity)
      toast.success(`${product.title} added to cart!`)
      
      // Reset quantity selector
      setQuantity(1)
      
      // Briefly show success state
      setTimeout(() => {
        setIsAdding(false)
      }, 1000)
    } catch (error) {
      toast.error('Failed to add item to cart')
      setIsAdding(false)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantity(newQuantity)
  }

  const handleUpdateCartQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(product.id, newQuantity)
    toast.success('Cart updated')
  }

  const handleViewCart = () => {
    openCart()
  }

  // Don't show for auction items
  if (product.isAuction) {
    return null
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50'
  }

  const baseClasses = `inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

  // If item is already in cart, show quantity controls
  if (isProductInCart) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => handleUpdateCartQuantity(currentQuantity - 1)}
            className="p-2 hover:bg-gray-100 rounded-l-lg"
            disabled={currentQuantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
            {currentQuantity}
          </span>
          <button
            onClick={() => handleUpdateCartQuantity(currentQuantity + 1)}
            className="p-2 hover:bg-gray-100 rounded-r-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleViewCart}
          className="btn btn-outline text-sm"
        >
          View Cart
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Quantity Selector (if enabled) */}
      {showQuantitySelector && (
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="p-2 hover:bg-gray-100 rounded-l-lg"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="p-2 hover:bg-gray-100 rounded-r-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={baseClasses}
      >
        {isAdding ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  )
} 