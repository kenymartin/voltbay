import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartSidebar from '../components/CartSidebar'

export default function GuestLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
      <CartSidebar />
    </div>
  )
} 