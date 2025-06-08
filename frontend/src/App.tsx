import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useAuthInit } from './hooks/useAuthInit'
import GuestLayout from './layouts/GuestLayout'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ProductDetailPage from './pages/ProductDetailPage'
import SearchPage from './pages/SearchPage'
import AuctionsPage from './pages/AuctionsPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import ProfilePage from './pages/ProfilePage'
import CreateProductPage from './pages/CreateProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import DashboardPage from './pages/user/DashboardPage'
import MessagesPage from './pages/user/MessagesPage'
import WalletPage from './pages/WalletPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const { isLoading } = useAuthInit()

  // Show loading spinner while initializing authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VoltBay...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes using GuestLayout - no authentication required */}
      <Route path="/" element={<GuestLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="auctions" element={<AuctionsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>

      {/* Protected routes that require authentication but use UserLayout */}
      <Route path="/" element={
        <ProtectedRoute>
          <UserLayout />
        </ProtectedRoute>
      }>
        <Route path="profile" element={<ProfilePage />} />
        <Route path="sell" element={<CreateProductPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dashboard/create-listing" element={<CreateProductPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="products/my" element={<Navigate to="/dashboard?tab=listings" replace />} />
      </Route>

      {/* Admin routes using AdminLayout - require admin authentication */}
      <Route path="/" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
      </Route>

      {/* Catch all routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App 