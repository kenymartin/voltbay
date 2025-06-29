import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { shouldShowFeature } from '../utils/userPermissions'

interface EnterpriseRouteGuardProps {
  children: React.ReactNode
  requiredPermission: 'canViewWallet' | 'canViewMyOrders' | 'canViewMyListings'
}

export default function EnterpriseRouteGuard({ children, requiredPermission }: EnterpriseRouteGuardProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !shouldShowFeature(user, requiredPermission)) {
      // Redirect enterprise users to home page
      navigate('/', { replace: true })
    }
  }, [user, requiredPermission, navigate])

  // If user doesn't have permission, don't render anything (redirect will happen)
  if (user && !shouldShowFeature(user, requiredPermission)) {
    return null
  }

  return <>{children}</>
} 