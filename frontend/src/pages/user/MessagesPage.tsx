import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Send, Search, ArrowLeft, Package, User, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import apiService from '../../services/api'
import type { Message, User as UserType, Product, ApiResponse } from '@shared/dist'

interface Conversation {
  id: string
  otherUser: UserType
  product?: Product
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Auto-select conversation from URL params
  useEffect(() => {
    const productId = searchParams.get('productId')
    const sellerId = searchParams.get('sellerId')
    
    if (productId && sellerId) {
      // Find or create conversation for this product/seller
      handleProductMessage(productId, sellerId)
    }
  }, [searchParams])

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await apiService.get<ApiResponse<Conversation[]>>('/api/messages/conversations')
      setConversations(response.data || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await apiService.get<ApiResponse<Message[]>>(`/api/messages/conversation/${conversationId}`)
      setMessages(response.data || [])
      
      // Mark messages as read
      await apiService.post(`/api/messages/conversation/${conversationId}/mark-read`)
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    }
  }

  const handleProductMessage = async (productId: string, sellerId: string) => {
    try {
      // Create or get conversation for this product
      const response = await apiService.post<ApiResponse<Conversation>>('/api/messages/conversation', {
        productId,
        participantId: sellerId
      })
      
      const conversation = response.data!
      setSelectedConversation(conversation.id)
      
      // Add to conversations if not already there
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversation.id)
        if (!exists) {
          return [conversation, ...prev]
        }
        return prev
      })
    } catch (error) {
      console.error('Failed to create conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    setSendingMessage(true)
    try {
      const response = await apiService.post<ApiResponse<Message>>('/api/messages', {
        conversationId: selectedConversation,
        content: newMessage.trim()
      })

      const message = response.data!
      setMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, lastMessage: message, updatedAt: new Date(message.sentAt).toISOString() }
            : conv
        )
      )
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.product?.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <div
      onClick={() => setSelectedConversation(conversation.id)}
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
        selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          {conversation.otherUser.avatar ? (
            <img
              src={conversation.otherUser.avatar}
              alt={conversation.otherUser.firstName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 truncate">
              {conversation.otherUser.firstName} {conversation.otherUser.lastName}
            </h3>
            <div className="flex items-center space-x-2">
              {conversation.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {conversation.unreadCount}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(conversation.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {conversation.product && (
            <div className="flex items-center space-x-1 mt-1">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600 truncate">{conversation.product.title}</span>
            </div>
          )}
          
          {conversation.lastMessage && (
            <p className="text-sm text-gray-600 truncate mt-1">
              {conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.senderId === user?.id
    
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {new Date(message.sentAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg shadow-md overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <User className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-600 mb-4">Start a conversation by messaging a seller</p>
              <button
                onClick={() => navigate('/search')}
                className="btn btn-primary"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation && selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-200 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedConv.otherUser.avatar ? (
                    <img
                      src={selectedConv.otherUser.avatar}
                      alt={selectedConv.otherUser.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {selectedConv.otherUser.firstName} {selectedConv.otherUser.lastName}
                  </h3>
                  {selectedConv.product && (
                    <div className="flex items-center space-x-1">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedConv.product.title}</span>
                    </div>
                  )}
                </div>
                
                {selectedConv.product && (
                  <button
                    onClick={() => navigate(`/products/${selectedConv.product!.id}`)}
                    className="btn btn-outline btn-sm"
                  >
                    View Product
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="btn btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <User className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 