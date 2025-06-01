import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartSidebar from '../components/CartSidebar'

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">User Dashboard</h1>
        <Outlet />
      </div>
      <CartSidebar />
    </div>
  )
} 