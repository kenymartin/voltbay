import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import apiService from '../services/api'
import { shouldShowFeature, isEnterpriseUser } from '../utils/userPermissions'
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search,
  Heart,
  ShoppingCart,
  Bell,
  Wallet,
  HardHat,
  ArrowLeft,
  Building2
} from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  const { getTotalItems, toggleCart, setCurrentUser } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Check if we're in Enterprise mode or if user is enterprise
  const isEnterpriseMode = location.pathname.startsWith('/enterprise') || 
                          location.pathname.startsWith('/roi') ||
                          isEnterpriseUser(user)

  // Sync cart with current user
  useEffect(() => {
    const userId = user?.id || null
    setCurrentUser(userId)
  }, [user?.id, setCurrentUser])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isProfileMenuOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [window.location.pathname])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await apiService.logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
      setIsProfileMenuOpen(false)
    }
  }

  const cartItemCount = getTotalItems()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main nav */}
          <div className="flex">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VoltBay</span>
            </Link>

            {/* Main navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {!isEnterpriseMode ? (
                <>
                  {shouldShowFeature(user, 'canAccessMarketplace') && (
                    <Link
                      to="/products"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Browse
                    </Link>
                  )}
                  {shouldShowFeature(user, 'canAccessAuctions') && (
                    <Link
                      to="/auctions"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Auctions
                    </Link>
                  )}
                  {shouldShowFeature(user, 'canAccessCategories') && (
                    <Link
                      to="/categories"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Categories
                    </Link>
                  )}
                  {shouldShowFeature(user, 'canAccessEnterprise') && (
                    <Link
                      to="/enterprise"
                      className="border-transparent text-sky-600 hover:border-sky-300 hover:text-sky-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium space-x-1"
                    >
                      <HardHat className="h-4 w-4" />
                      <span>Enterprise</span>
                      <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  {!isEnterpriseUser(user) && (
                    <Link
                      to="/"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium space-x-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to VoltBay</span>
                    </Link>
                  )}
                  {shouldShowFeature(user, 'canAccessEnterprise') && (
                    <Link
                      to="/enterprise"
                      className={`flex items-center px-4 py-2 text-sm ${
                        location.pathname === '/enterprise' 
                          ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <HardHat className="h-4 w-4 mr-2" />
                      Enterprise
                    </Link>
                  )}
                  {shouldShowFeature(user, 'canAccessROICalculator') && (
                    <Link
                      to="/roi-calculator"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        location.pathname === '/roi-calculator' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      ROI Simulator
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden sm:flex sm:items-center sm:max-w-xs sm:w-full sm:mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Right side - Auth and user actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Authenticated user menu */}
                <button className="text-gray-500 hover:text-gray-700">
                  <Heart className="h-6 w-6" />
                </button>
                <NotificationDropdown />

                {/* Shopping Cart - Only for regular customers */}
                {shouldShowFeature(user, 'showShoppingCart') && (
                  <button
                    onClick={toggleCart}
                    className="relative text-gray-500 hover:text-gray-700 p-2"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount > 9 ? '9+' : cartItemCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Sell Button - Only for regular vendors */}
                {shouldShowFeature(user, 'showSellButton') && (
                  <Link
                    to="/sell"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Sell
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.firstName || 'User'}
                    </span>
                  </button>

                  {/* Profile dropdown menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50" ref={profileMenuRef}>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/wallet"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Wallet className="h-4 w-4" />
                        <span>Wallet</span>
                      </Link>
                      {/* Profiles section for enterprise users */}
                      {isEnterpriseUser(user) ? (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Profiles</div>
                          <Link
                            to="/company/profile/manage"
                            className="block px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Building2 className="h-4 w-4" />
                            <span>Company</span>
                          </Link>
                          <Link
                            to="/profile"
                            className="block px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Personal</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      )}
                      <Link
                        to="/messages"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Messages
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium text-purple-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/products/my"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Products
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Guest users can also see the cart */}
                <button
                  onClick={toggleCart}
                  className="relative text-gray-500 hover:text-gray-700 p-2"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </button>

                {/* Guest user buttons */}
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden text-gray-500 hover:text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {!isEnterpriseMode ? (
              <>
                {shouldShowFeature(user, 'canAccessMarketplace') && (
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse
                  </Link>
                )}
                {shouldShowFeature(user, 'canAccessAuctions') && (
                  <Link
                    to="/auctions"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Auctions
                  </Link>
                )}
                {shouldShowFeature(user, 'canAccessCategories') && (
                  <Link
                    to="/categories"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Categories
                  </Link>
                )}
                {shouldShowFeature(user, 'canAccessEnterprise') && (
                  <Link
                    to="/enterprise"
                    className="flex items-center px-4 py-2 text-sm text-sky-600 hover:bg-gray-100 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HardHat className="h-4 w-4 mr-2" />
                    Enterprise
                    <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold ml-auto">NEW</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                {!isEnterpriseUser(user) && (
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to VoltBay
                  </Link>
                )}
                {shouldShowFeature(user, 'canAccessEnterprise') && (
                  <Link
                    to="/enterprise"
                    className={`flex items-center px-4 py-2 text-sm ${
                      location.pathname === '/enterprise' 
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HardHat className="h-4 w-4 mr-2" />
                    Enterprise
                  </Link>
                )}
                {shouldShowFeature(user, 'canAccessROICalculator') && (
                  <Link
                    to="/roi-calculator"
                    className={`block px-4 py-2 text-sm ${
                      location.pathname === '/roi-calculator' 
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ROI Simulator
                  </Link>
                )}
              </>
            )}
            
            {/* Mobile search */}
            <div className="px-4 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Mobile Cart - Only for regular customers */}
            {shouldShowFeature(user, 'showShoppingCart') && (
              <button
                onClick={() => {
                  toggleCart()
                  setIsMenuOpen(false)
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Cart ({cartItemCount})
              </button>
            )}

            {isAuthenticated && (
              <>
                <hr className="my-2" />
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Wallet className="h-5 w-5 mr-3" />
                  Wallet
                </Link>
                {/* Profiles section for enterprise users */}
                {isEnterpriseUser(user) ? (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Profiles</div>
                    <Link
                      to="/company/profile/manage"
                      className="flex items-center px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Building2 className="h-5 w-5 mr-3" />
                      Company
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Personal
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium text-purple-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 