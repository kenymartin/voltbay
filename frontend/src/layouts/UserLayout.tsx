import { Outlet } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import CartSidebar from '../components/CartSidebar'

export default function UserLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Outlet />
        <CartSidebar />
      </div>
    </ProtectedRoute>
  )
} 