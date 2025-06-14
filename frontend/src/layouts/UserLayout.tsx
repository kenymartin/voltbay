import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartSidebar from '../components/CartSidebar'
import ProtectedRoute from '../components/ProtectedRoute'

export default function UserLayout() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Outlet />
        <CartSidebar />
      </div>
    </ProtectedRoute>
  )
} 