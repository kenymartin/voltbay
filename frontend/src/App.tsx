import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import GuestLayout from './layouts/GuestLayout'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { initGlobalImageFix, fixExistingImages } from './utils/globalImageFix'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ProductDetailPage from './pages/ProductDetailPage'
import SearchPage from './pages/SearchPage'
import AuctionsPage from './pages/AuctionsPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import Enterprise from './pages/Enterprise'
import VendorDetailPage from './pages/VendorDetailPage'
import ROICalculator from './pages/ROICalculator'
import ProfilePage from './pages/ProfilePage'
import CreateProductPage from './pages/CreateProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import DashboardPage from './pages/user/DashboardPage'
import MessagesPage from './pages/user/MessagesPage'
import MyProductsPage from './pages/user/MyProductsPage'
import WalletPage from './pages/WalletPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import CreateCategoryPage from './pages/admin/CreateCategoryPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const { user, checkAuth } = useAuthStore()
  const { setCurrentUser } = useCartStore()

  useEffect(() => {
    checkAuth()
    
    // Initialize global image fix to handle problematic URLs
    initGlobalImageFix()
    
    // Fix any existing images on the page
    setTimeout(() => {
      fixExistingImages()
    }, 1000)
  }, [checkAuth])

  // Initialize cart with current user on app load
  useEffect(() => {
    const userId = user?.id || null
    setCurrentUser(userId)
  }, [user?.id, setCurrentUser])

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<GuestLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/roi-calculator" element={<ROICalculator />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/enterprise/vendor/:vendorId" element={<VendorDetailPage />} />
        </Route>

        {/* Auth routes - redirect to dashboard if already logged in */}
        <Route path="/" element={<GuestLayout />}>
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected routes that require authentication but can be accessed by guests with redirect */}
        <Route path="/" element={<GuestLayout />}>
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute requireAuth={true}>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order-success" 
            element={
              <ProtectedRoute requireAuth={true}>
                <OrderSuccessPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Protected user routes */}
        <Route path="/" element={<UserLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sell" element={<CreateProductPage />} />
          <Route path="/sell/edit/:id" element={<CreateProductPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/products/my" element={<MyProductsPage />} />
          <Route path="/wallet" element={<WalletPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="categories/create" element={<CreateCategoryPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App 