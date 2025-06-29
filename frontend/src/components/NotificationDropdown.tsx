import { useState, useEffect, useRef } from 'react'
import { Bell, X, MessageCircle, Package, ShoppingCart, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import { useAuthStore } from '../store/authStore'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  data?: any
  createdAt: string
}

interface NotificationDropdownProps {
  className?: string
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch unread count on component mount and interval
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      // Reduce polling frequency to every 2 minutes to avoid rate limits
      const interval = setInterval(fetchUnreadCount, 120000) // Check every 2 minutes
      return () => clearInterval(interval)
    }
  }, [user])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications(1)
    }
  }, [isOpen, user])

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.get('/api/notifications/unread-count')
      if (response.success) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error: any) {
      // Don't log errors for rate limiting to avoid console spam
      if (error.response?.status !== 429) {
        console.error('Error fetching unread count:', error)
      }
    }
  }

  const fetchNotifications = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      const response = await apiService.get(
        `/api/notifications?page=${pageNum}&limit=20&unreadOnly=false`
      )
      
      if (response.success) {
        const newNotifications = response.data.notifications || []
        if (pageNum === 1) {
          setNotifications(newNotifications)
        } else {
          setNotifications(prev => [...prev, ...newNotifications])
        }
        setHasMore(newNotifications.length === 20)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.patch(`/api/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiService.patch('/api/notifications/mark-all-read')
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'MESSAGE_RECEIVED':
        if (notification.data?.senderId) {
          // Navigate directly to the conversation with the sender
          navigate(`/messages?user=${notification.data.senderId}`)
        } else {
          navigate('/messages')
        }
        break
      case 'ORDER_CONFIRMED':
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
        navigate('/orders')
        break
      case 'BID_PLACED':
      case 'BID_OUTBID':
      case 'AUCTION_WON':
      case 'AUCTION_ENDED':
        if (notification.data?.productId) {
          navigate(`/products/${notification.data.productId}`)
        } else {
          navigate('/products/my')
        }
        break
      default:
        // For other types, go to home page (dashboard only for admins)
        navigate('/')
    }

    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE_RECEIVED':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'ORDER_CONFIRMED':
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
        return <Package className="h-5 w-5 text-green-500" />
      case 'BID_PLACED':
      case 'BID_OUTBID':
      case 'AUCTION_WON':
      case 'AUCTION_ENDED':
        return <ShoppingCart className="h-5 w-5 text-orange-500" />
      case 'REVIEW_RECEIVED':
        return <Star className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1)
    }
  }

  if (!user) return null

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium text-gray-900 ${
                            !notification.isRead ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="p-4 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {user?.role === 'ADMIN' && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/dashboard')
                  setIsOpen(false)
                }}
                className="w-full text-sm text-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View all in dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 