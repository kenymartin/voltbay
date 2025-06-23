import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Send, Search, ArrowLeft, Package, User, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import apiService from '../../services/api'
import type { Message, User as UserType, Product, ApiResponse } from '@shared/dist'

interface Conversation {
  id: string
  otherUser?: UserType
  otherParticipant?: UserType
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
  
  // State declarations MUST come before useEffect hooks
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [processedUsers, setProcessedUsers] = useState<Set<string>>(new Set())
  const processingUserRef = useRef<string | null>(null)
  
  // Debug URL parameters and state
  useEffect(() => {
    console.log('🌐 MessagesPage loaded with URL params:')
    console.log('  - user:', searchParams.get('user'))
    console.log('  - productId:', searchParams.get('productId'))
    console.log('  - sellerId:', searchParams.get('sellerId'))
    console.log('  - messageId:', searchParams.get('messageId'))
    console.log('🔐 Current user:', user?.id, user?.firstName)
    console.log('📋 Loading state:', loading)
    console.log('💬 Conversations count:', conversations.length)
  }, [searchParams, user, loading, conversations.length])

  // Auto-select conversation from URL params
  useEffect(() => {
    const productId = searchParams.get('productId')
    const sellerId = searchParams.get('sellerId')
    const userId = searchParams.get('user')
    const messageId = searchParams.get('messageId')
    
    console.log('🔄 URL params effect triggered:', { productId, sellerId, userId, messageId, loading, selectedConversation })
    
    // Only run this effect after conversations are loaded
    if (loading) {
      console.log('⏳ Still loading, waiting...')
      return
    }
    
    // Don't process URL params if we already have a conversation selected
    if (selectedConversation) {
      console.log('✅ Conversation already selected, skipping URL processing:', selectedConversation)
      return
    }
    
    console.log('🚀 Processing URL parameters after loading complete')
    
    if (productId && sellerId) {
      // Find or create conversation for this product/seller
      console.log('🛍️ Processing product message:', productId, sellerId)
      handleProductMessage(productId, sellerId)
    } else if (messageId) {
      // Find conversation containing this message
      console.log('💬 Processing message navigation:', messageId)
      handleMessageNavigation(messageId)
    } else if (userId) {
      // Find existing conversation with this user
      console.log('👤 Processing user conversation:', userId)
      handleUserConversation(userId)
    } else {
      console.log('ℹ️ No URL parameters to process')
    }
  }, [searchParams, loading, selectedConversation])

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  // Handle URL parameters after conversations are loaded
  useEffect(() => {
    if (!loading && conversations.length === 0 && !selectedConversation) {
      // If no conversations exist, but we have a user parameter, try to load direct messages
      const userId = searchParams.get('user')
      if (userId) {
        console.log('🔄 No formal conversations found, loading direct messages for user:', userId)
        handleUserConversation(userId)
      }
    }
  }, [loading, conversations.length, searchParams, selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await apiService.get('/api/messages/conversations')
      console.log('🔍 Raw API response:', response)
      
      // The API returns: { success: true, data: { conversations: [...], pagination: {...} } }
      let conversationsList: Conversation[] = []
      
      if (response && response.data && response.data.conversations && Array.isArray(response.data.conversations)) {
        conversationsList = response.data.conversations
      } else if (response && response.data && Array.isArray(response.data)) {
        conversationsList = response.data
      } else if (response && Array.isArray(response)) {
        conversationsList = response
      }
      
      console.log('📋 Fetched conversations:', conversationsList.length)
      
      // If no formal conversations exist, we'll handle this in the useEffect
      if (conversationsList.length === 0) {
        console.log('📭 No formal conversations found')
      }
      
      setConversations(conversationsList)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      toast.error('Failed to load conversations')
      // Ensure conversations is always an array even on error
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('📨 Fetching messages for conversation:', conversationId)
      
      // Check if this is a direct message conversation
      if (conversationId.startsWith('direct-')) {
        const userId = conversationId.replace('direct-', '')
        console.log('📨 Fetching direct messages with user:', userId)
        
        const response = await apiService.get(`/api/messages/${userId}`)
        console.log('📨 Direct messages API response:', response)
        
        // Handle the response structure properly
        const messagesData = response.data?.messages || response.data || []
        console.log('📨 Extracted messages:', messagesData.length, messagesData)
        
        // Sort messages by date (oldest first for display)
        const sortedMessages = messagesData.sort((a: any, b: any) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        )
        
        setMessages(sortedMessages)
        console.log('📨 Set messages in state:', sortedMessages.length)
        
        // Mark direct messages as read
        const unreadMessages = messagesData.filter((m: any) => !m.isRead && m.receiverId === user?.id) || []
        if (unreadMessages.length > 0) {
          await apiService.patch('/api/messages/read', {
            messageIds: unreadMessages.map((m: any) => m.id)
          })
        }
        
        // Update conversation unread count
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        )
      } else {
        // Handle formal conversation messages
        console.log('💬 Fetching formal conversation messages:', conversationId)
        const response = await apiService.get<ApiResponse<Message[]>>(`/api/messages/conversation/${conversationId}`)
        console.log('💬 Formal conversation API response:', response)
        
        const messagesData = response.data || []
        const sortedMessages = messagesData.sort((a: any, b: any) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        )
        
        setMessages(sortedMessages)
        
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
      }
      
      // Scroll to bottom after loading messages
      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error)
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

  const handleUserConversation = async (userId: string) => {
    console.log('🔍 handleUserConversation called with userId:', userId)
    console.log('📋 Current conversations:', conversations.length)
    
    // Prevent duplicate calls for the same user
    if (selectedConversation === `direct-${userId}` || 
        processedUsers.has(userId) || 
        processingUserRef.current === userId) {
      console.log('✅ Already processed this user or have conversation selected, skipping')
      return
    }
    
    // Mark this user as being processed
    processingUserRef.current = userId
    setProcessedUsers(prev => new Set(prev).add(userId))
    
    try {
      // First, try to find existing conversation with this user
      const existingConversation = conversations.find(conv => 
        (conv.otherUser?.id === userId) || (conv.otherParticipant?.id === userId)
      )
      
      console.log('🔍 Existing conversation found:', existingConversation ? 'YES' : 'NO')
      
      if (existingConversation) {
        console.log('✅ Selecting existing conversation:', existingConversation.id)
        setSelectedConversation(existingConversation.id)
        // Clear URL parameters to prevent re-processing
        navigate('/messages', { replace: true })
      } else {
        // If no formal conversation exists, try to load direct messages with this user
        console.log('📨 Loading direct messages with user:', userId)
        const directMessagesResponse = await apiService.get(`/api/messages/${userId}`)
        console.log('📨 Direct messages response:', directMessagesResponse)
        
        if (directMessagesResponse.success && directMessagesResponse.data?.messages?.length > 0) {
          // Create a temporary conversation object for display
          const messages = directMessagesResponse.data.messages
          const otherUser = messages[0].senderId === user?.id ? messages[0].receiver : messages[0].sender
          
          console.log('👤 Other user:', otherUser)
          console.log('💬 Messages count:', messages.length)
          
          // Check if otherUser exists and has required properties
          if (!otherUser || !otherUser.firstName) {
            console.error('❌ Other user data is incomplete:', otherUser)
            toast.error('Unable to load user information for this conversation')
            return
          }
          
          const tempConversation: Conversation = {
            id: `direct-${userId}`,
            otherUser: otherUser,
            lastMessage: messages[messages.length - 1],
            unreadCount: messages.filter((m: any) => !m.isRead && m.receiverId === user?.id).length,
            updatedAt: messages[messages.length - 1].sentAt
          }
          
          console.log('🆕 Creating temp conversation:', tempConversation)
          
          // Check if this conversation already exists to prevent duplicates
          const existingTemp = conversations.find(conv => conv.id === tempConversation.id)
          if (!existingTemp) {
            // Add this temporary conversation to the list
            setConversations(prev => {
              const updated = [tempConversation, ...prev]
              console.log('📋 Updated conversations list:', updated.length)
              return updated
            })
          }
          
          setSelectedConversation(tempConversation.id)
          
          // Load the messages
          setMessages(messages)
          
          // Clear URL parameters to prevent re-processing
          navigate('/messages', { replace: true })
          
          toast.success(`Opened conversation with ${otherUser.firstName} ${otherUser.lastName}`)
        } else {
          console.log('❌ No messages found')
          toast.info('No messages found with this user')
        }
      }
    } catch (error: any) {
      // Don't log rate limit errors to avoid console spam
      if (error.response?.status !== 429) {
        console.error('❌ Failed to load direct messages:', error)
        toast.error('Failed to load conversation')
      }
    } finally {
      // Clear the processing ref
      if (processingUserRef.current === userId) {
        processingUserRef.current = null
      }
    }
  }

  const handleMessageNavigation = async (messageId: string) => {
    try {
      // Fetch the specific message to get its conversation ID
      const response = await apiService.get(`/api/messages/message/${messageId}`)
      if (response.success && response.data) {
        const message = response.data
        
        // If the message has a conversationId, select that conversation
        if (message.conversationId) {
          setSelectedConversation(message.conversationId)
          
          // Make sure the conversation is in our list
          const existingConv = conversations.find(c => c.id === message.conversationId)
          if (!existingConv) {
            // Refresh conversations to include this one
            await fetchConversations()
          }
        } else {
          // For older messages without conversationId, find conversation by sender
          const senderId = message.senderId === user?.id ? message.receiver.id : message.sender.id
          const existingConversation = conversations.find(conv => 
            conv.otherUser.id === senderId
          )
          
          if (existingConversation) {
            setSelectedConversation(existingConversation.id)
          } else {
            // If no conversation exists, show a message and navigate to the messages page
            toast.info(`Opening conversation with ${message.sender.firstName} ${message.sender.lastName}`)
            // Still try to find by URL parameter as fallback
            const userId = searchParams.get('user')
            if (userId) {
              handleUserConversation(userId)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch message details:', error)
      // Fallback to user conversation
      const userId = searchParams.get('user')
      if (userId) {
        handleUserConversation(userId)
      } else {
        toast.error('Could not load message details')
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    console.log('🚀 Sending message...', { selectedConversation, newMessage: newMessage.trim() })
    setSendingMessage(true)
    
    try {
      let response
      
      // Check if this is a direct message conversation
      if (selectedConversation.startsWith('direct-')) {
        const userId = selectedConversation.replace('direct-', '')
        console.log('📨 Sending direct message to user:', userId)
        response = await apiService.post<ApiResponse<Message>>('/api/messages', {
          receiverId: userId,
          content: newMessage.trim(),
          messageType: 'GENERAL'
        })
      } else {
        // Handle formal conversation message
        console.log('💬 Sending formal conversation message to:', selectedConversation)
        response = await apiService.post<ApiResponse<Message>>('/api/messages', {
          conversationId: selectedConversation,
          content: newMessage.trim()
        })
      }

      console.log('✅ Message sent successfully:', response)
      const message = response.data!
      console.log('📝 Message data received:', message)
      
      // Ensure the message has the current user as sender if not present
      const messageWithSender = {
        ...message,
        senderId: message.senderId || user?.id,
        sender: message.sender || {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          avatar: user?.avatar
        }
      }
      
      console.log('📝 Adding message to UI:', messageWithSender)
      setMessages(prev => [...prev, messageWithSender])
      setNewMessage('')
      
      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, lastMessage: message, updatedAt: message.sentAt || new Date().toISOString() }
            : conv
        )
      )
      
      // Scroll to bottom to show new message
      setTimeout(() => scrollToBottom(), 100)
      
      // Also refresh messages to ensure we have the latest data
      if (selectedConversation.startsWith('direct-')) {
        const userId = selectedConversation.replace('direct-', '')
        console.log('🔄 Refreshing messages after send...')
        setTimeout(() => {
          fetchMessages(selectedConversation)
        }, 500)
      }
      
      console.log('✅ Message send process completed successfully')
    } catch (error: any) {
      console.error('❌ Error sending message:', error)
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

  const filteredConversations = (conversations || []).filter(conv => {
    const otherUser = conv.otherUser || conv.otherParticipant
    return (
      otherUser?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const selectedConv = (conversations || []).find(c => c.id === selectedConversation)

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const otherUser = conversation.otherUser || conversation.otherParticipant
    
    return (
      <div
        onClick={() => setSelectedConversation(conversation.id)}
        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
          selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            {otherUser?.avatar ? (
              <img
                src={otherUser.avatar}
                alt={otherUser.firstName || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900 truncate">
                {otherUser?.firstName} {otherUser?.lastName}
              </h3>
              <div className="flex items-center space-x-2">
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {conversation.unreadCount}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {(() => {
                    if (!conversation.updatedAt) return 'Recent'
                    try {
                      const date = new Date(conversation.updatedAt)
                      if (isNaN(date.getTime())) return 'Recent'
                      return date.toLocaleDateString()
                    } catch {
                      return 'Recent'
                    }
                  })()}
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
  }

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.senderId === user?.id
    console.log('💬 MessageBubble:', { messageId: message.id, content: message.content, senderId: message.senderId, userId: user?.id, isOwn })
    
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
            {(() => {
              if (!message.sentAt) return 'Just now'
              try {
                const date = new Date(message.sentAt)
                if (isNaN(date.getTime())) return 'Just now'
                return date.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              } catch {
                return 'Just now'
              }
            })()}
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
              <p className="text-gray-600 mb-4">
                {searchParams.get('user') ? 
                  'Loading conversation...' : 
                  'Start a conversation by messaging a seller'
                }
              </p>
              {!searchParams.get('user') && (
                <button
                  onClick={() => navigate('/search')}
                  className="btn btn-primary"
                >
                  Browse Products
                </button>
              )}
              {searchParams.get('user') && (
                <button
                  onClick={() => {
                    const userId = searchParams.get('user')
                    if (userId) {
                      console.log('🔄 Manual retry: Loading conversation with user:', userId)
                      handleUserConversation(userId)
                    }
                  }}
                  className="btn btn-primary"
                >
                  🔄 Load Conversation
                </button>
              )}
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
                  {(selectedConv.otherUser || selectedConv.otherParticipant)?.avatar ? (
                    <img
                      src={(selectedConv.otherUser || selectedConv.otherParticipant)!.avatar!}
                      alt={(selectedConv.otherUser || selectedConv.otherParticipant)?.firstName || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {(selectedConv.otherUser || selectedConv.otherParticipant)?.firstName} {(selectedConv.otherUser || selectedConv.otherParticipant)?.lastName}
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
              {(() => {
                console.log('🗨️ Rendering messages:', messages.length, messages);
                return messages.length > 0 ? (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                );
              })()}
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