'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Send, MessageCircle, Search, User, X, Paperclip, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  last_message_at: string
  other_user: {
    id: string
    email: string
    profile?: {
      first_name?: string
      last_name?: string
      avatar_url?: string
    }
  }
  last_message?: {
    content: string
    sender_id: string
    created_at: string
    attachment_url?: string
    attachment_type?: string
    attachment_name?: string
  }
  unread_count: number
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
  attachment_url?: string
  attachment_type?: string
  attachment_name?: string
  attachment_size?: number
  sender?: {
    email: string
    profile?: {
      first_name?: string
      last_name?: string
      avatar_url?: string
    }
  }
}

export default function MessagesPage() {
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showMobileConversations, setShowMobileConversations] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    loadUser()
    loadConversations()

    // Subscribe to new messages to update conversation list
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      markAsRead(selectedConversation.id)
      const cleanup = subscribeToMessages(selectedConversation.id)
      return cleanup
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)
  }

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get conversations where user is either user1 or user2
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Enrich with other user info and last message
      const enrichedConvs = await Promise.all(
        (convs || []).map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
          
          // Get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', otherUserId)
            .single()

          // Get other user's email via RPC function
          let otherUserEmail = `user-${otherUserId.substring(0, 8)}`
          try {
            const { data: emailData } = await supabase
              .rpc('get_user_email', { p_user_id: otherUserId })
            if (emailData) {
              otherUserEmail = emailData
            }
          } catch (e) {
            console.error('Error getting user email:', e)
          }

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false)

          return {
            ...conv,
            other_user: {
              id: otherUserId,
              email: otherUserEmail,
              profile: profile || null,
            },
            last_message: lastMsg || null,
            unread_count: unreadCount || 0,
          }
        })
      )

      setConversations(enrichedConvs as Conversation[])
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Enrich with sender info
      const enrichedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', msg.sender_id)
            .single()

          // Get sender email
          let senderEmail = 'Unknown'
          try {
            const { data: emailData } = await supabase
              .rpc('get_user_email', { p_user_id: msg.sender_id })
            if (emailData) {
              senderEmail = emailData
            }
          } catch (e) {
            console.error('Error getting sender email:', e)
          }

          return {
            ...msg,
            sender: {
              email: senderEmail,
              profile: profile || null,
            },
          }
        })
      )

      setMessages(enrichedMessages as Message[])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    }
  }

  const subscribeToMessages = (conversationId: string) => {
    // Unsubscribe from any existing channel first
    const channelName = `messages:${conversationId}`
    const channel = supabase.channel(channelName)
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Immediately add the new message to the UI for instant delivery
          const newMessage = payload.new as any
          
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMessage.id)
            if (exists) return prev
            
            // Add immediately with basic info, then enrich
            const tempMessage: Message = {
              ...newMessage,
              sender: {
                email: 'Loading...',
                profile: null,
              },
            }
            
            // Enrich in background
            (async () => {
              try {
                const { data: profile } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('user_id', newMessage.sender_id)
                  .single()

                let senderEmail = 'Unknown'
                try {
                  const { data: emailData } = await supabase
                    .rpc('get_user_email', { p_user_id: newMessage.sender_id })
                  if (emailData) senderEmail = emailData
                } catch (e) {}

                // Update the message with enriched data
                setMessages(prevMsgs => 
                  prevMsgs.map(msg => 
                    msg.id === newMessage.id 
                      ? {
                          ...msg,
                          sender: {
                            email: senderEmail,
                            profile: profile || null,
                          },
                        }
                      : msg
                  )
                )
              } catch (e) {
                console.error('Error enriching message:', e)
              }
            })()
            
            return [...prev, tempMessage]
          })
          
          // Mark as read if it's for current user
          if (newMessage.recipient_id === currentUserId) {
            markAsRead(conversationId)
          }

          // Update conversation list
          loadConversations()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages for conversation:', conversationId)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || !currentUserId) return

    setIsSending(true)
    setIsUploading(!!selectedFile)
    
    try {
      const recipientId = selectedConversation.other_user.id
      let attachmentUrl: string | null = null
      let attachmentType: string | null = null
      let attachmentName: string | null = null
      let attachmentSize: number | null = null

      // Upload file if selected
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `${selectedConversation.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            if (uploadError.message.includes('Bucket not found')) {
              toast.error('File storage not configured. Please set up the "message-attachments" bucket in Supabase Storage.')
              setIsSending(false)
              setIsUploading(false)
              return
            }
            throw uploadError
          }

          // Get signed URL (valid for 1 year)
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('message-attachments')
            .createSignedUrl(filePath, 31536000)

          if (!urlError && signedUrlData) {
            attachmentUrl = signedUrlData.signedUrl
          } else {
            // Fallback to public URL
            const { data: { publicUrl } } = supabase.storage
              .from('message-attachments')
              .getPublicUrl(filePath)
            attachmentUrl = publicUrl
          }

          attachmentType = selectedFile.type || 'application/octet-stream'
          attachmentName = selectedFile.name
          attachmentSize = selectedFile.size
        } catch (error: any) {
          console.error('Error uploading file:', error)
          toast.error('Failed to upload file')
          setIsSending(false)
          setIsUploading(false)
          return
        }
      }

      // Send message and get the inserted message back
      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: newMessage.trim() || (selectedFile ? `Sent ${selectedFile.name}` : ''),
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          attachment_name: attachmentName,
          attachment_size: attachmentSize,
        })
        .select()
        .single()

      if (error) throw error

      // Add message immediately for instant feedback (before real-time subscription)
      if (insertedMessage) {
        const { data: { user } } = await supabase.auth.getUser()
        const optimisticMessage: Message = {
          ...insertedMessage,
          sender: {
            email: user?.email || 'You',
            profile: null,
          },
        }
        setMessages(prev => {
          const exists = prev.some(m => m.id === optimisticMessage.id)
          if (exists) return prev
          return [...prev, optimisticMessage]
        })
      }

      // Clear input immediately
      setNewMessage('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Reload to ensure consistency (real-time will also update)
      setTimeout(() => {
        loadMessages(selectedConversation.id)
        loadConversations()
      }, 500)
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
      setIsUploading(false)
    }
  }

  const handleStartConversation = async () => {
    if (!searchEmail.trim() || !currentUserId) return

    setIsSearching(true)
    try {
      // Find user by email
      const { data: targetUser, error: lookupError } = await supabase
        .rpc('find_user_by_email', { p_email: searchEmail.toLowerCase().trim() })

      if (lookupError) throw lookupError

      let targetUserId: string | null = null
      if (Array.isArray(targetUser)) {
        if (targetUser.length > 0 && targetUser[0]) {
          targetUserId = (targetUser[0] as any)?.id || null
        }
      } else if (targetUser && typeof targetUser === 'object') {
        targetUserId = (targetUser as any)?.id || null
      }

      if (!targetUserId) {
        toast.error('User not found')
        return
      }

      if (targetUserId === currentUserId) {
        toast.error('You cannot message yourself')
        return
      }

      // Get or create conversation
      const { data: conversationId, error: convError } = await supabase
        .rpc('get_or_create_conversation', {
          p_user1_id: currentUserId,
          p_user2_id: targetUserId,
        })

      if (convError) throw convError

      // Reload conversations and select the new one
      await loadConversations()
      const newConv = conversations.find(
        (c) => c.other_user.id === targetUserId
      ) || conversations[0]
      
      if (newConv) {
        setSelectedConversation(newConv)
      }

      setSearchEmail('')
      toast.success('Conversation started')
    } catch (error: any) {
      console.error('Error starting conversation:', error)
      toast.error(error.message || 'Failed to start conversation')
    } finally {
      setIsSearching(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getDisplayName = (user: Conversation['other_user']) => {
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`
    }
    if (user.profile?.first_name) {
      return user.profile.first_name
    }
    return user.email.split('@')[0]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-3 md:gap-4">
      {/* Conversations List */}
      <div className={`${showMobileConversations ? 'flex' : 'hidden'} md:flex w-full md:w-80 h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            {selectedConversation && (
              <button
                onClick={() => {
                  setSelectedConversation(null)
                  setShowMobileConversations(true)
                }}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          {/* Search/Start Conversation */}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Email to message..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartConversation()}
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleStartConversation}
              disabled={isSearching || !searchEmail.trim()}
              size="sm"
              className="px-3"
            >
              <Search size={16} />
            </Button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="text-gray-400 dark:text-gray-500 mx-auto mb-2" size={32} />
              <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv)
                    setShowMobileConversations(false)
                  }}
                  className={`w-full text-left p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {conv.other_user.profile?.avatar_url ? (
                      <img
                        src={conv.other_user.profile.avatar_url}
                        alt={getDisplayName(conv.other_user)}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {getDisplayName(conv.other_user)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {getDisplayName(conv.other_user)}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conv.last_message.attachment_url ? (
                            <span className="flex items-center gap-1">
                              <Paperclip size={12} />
                              {conv.last_message.attachment_name || 'Attachment'}
                            </span>
                          ) : (
                            conv.last_message.content
                          )}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatRelativeTime(conv.last_message_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className={`${selectedConversation ? 'flex' : 'hidden'} md:flex flex-1 h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 flex-col`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-3 md:p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedConversation(null)
                    setShowMobileConversations(true)
                  }}
                  className="md:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
                {selectedConversation.other_user.profile?.avatar_url ? (
                  <img
                    src={selectedConversation.other_user.profile.avatar_url}
                    alt={getDisplayName(selectedConversation.other_user)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs md:text-sm font-bold">
                      {getDisplayName(selectedConversation.other_user)[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">
                    {getDisplayName(selectedConversation.other_user)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedConversation.other_user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === currentUserId
                const isImage = msg.attachment_url && msg.attachment_type?.startsWith('image/')
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-2 md:px-4 md:py-2 ${
                        isOwn
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {/* Attachment */}
                      {msg.attachment_url && (
                        <div className="mb-2">
                          {isImage ? (
                            <div className="relative rounded-lg overflow-hidden max-w-full">
                              <img
                                src={msg.attachment_url}
                                alt="Shared image"
                                className="max-w-full h-auto max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedImage(msg.attachment_url || null)}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-white/10 dark:bg-black/20 rounded-lg">
                              <Paperclip size={16} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{msg.attachment_name || 'File'}</p>
                                {msg.attachment_size && (
                                  <p className="text-xs opacity-75">
                                    {(msg.attachment_size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                              <a
                                href={msg.attachment_url}
                                download={msg.attachment_name}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Message Content */}
                      {msg.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                      
                      {/* Timestamp - always show below image or message */}
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {formatRelativeTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 md:p-4 border-t border-gray-200 dark:border-slate-700">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  {selectedFile.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <Paperclip className="text-gray-500" size={20} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  size="sm"
                  className="px-3 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 text-sm"
                  disabled={isSending || isUploading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-3 md:px-4"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <MessageCircle className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400">Select a conversation to start messaging</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Or search for a user by email above
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 dark:bg-black/95 p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70 z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

