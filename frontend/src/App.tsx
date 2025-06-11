import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import GuestLayout from './layouts/GuestLayout'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

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
import MyProductsPage from './pages/user/MyProductsPage'
import WalletPage from './pages/WalletPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const { user } = useAuthStore()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<GuestLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/auctions" element={<AuctionsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
      </Route>

      {/* Protected user routes */}
      <Route path="/" element={<UserLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sell" element={<CreateProductPage />} />
        <Route path="/sell/edit/:id" element={<CreateProductPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/products/my" element={<MyProductsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App 