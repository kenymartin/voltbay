import { useCartStore } from '../store/cartStore'
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCartStore()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      toast.success('Item removed from cart')
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleRemoveItem = (productId: string, productTitle: string) => {
    removeFromCart(productId)
    toast.success(`${productTitle} removed from cart`)
  }

  const handleClearCart = () => {
    clearCart()
    toast.success('Cart cleared')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeCart}
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">
                Shopping Cart ({getTotalItems()})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-sm text-center mb-4">
                  Start shopping to add items to your cart
                </p>
                <Link
                  to="/products"
                  onClick={closeCart}
                  className="btn btn-primary"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Cart</span>
                    </button>
                  </div>
                )}

                {/* Cart Items */}
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.imageUrls?.[0] || '/placeholder-product.jpg'}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)}
                      </p>
                      
                      {/* Condition Badge */}
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {item.product.condition}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.productId, item.product.title)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="mt-2 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                onClick={closeCart}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/products"
                onClick={closeCart}
                className="w-full btn btn-outline text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 