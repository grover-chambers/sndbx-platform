"use client"

import { useState } from "react"
import { Search, Send, User, Clock, MessageSquare, Phone, Video, MoreVertical } from "lucide-react"

interface Message {
  id: string
  sender: string
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
  isClient: boolean
}

interface Conversation {
  id: string
  clientName: string
  clientCompany: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  avatar: string
  messages: Message[]
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1")
  const [newMessage, setNewMessage] = useState("")
  
  // Mock conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      clientName: "John Mwangi",
      clientCompany: "TechCorp Kenya",
      lastMessage: "Thanks for the proposal, I'll review it",
      lastMessageTime: "10:30 AM",
      unreadCount: 2,
      avatar: "JM",
      messages: [
        { id: "1", sender: "client", senderName: "John Mwangi", content: "Hi, I'm interested in your web development services", timestamp: "Yesterday, 3:00 PM", isRead: true, isClient: true },
        { id: "2", sender: "company", senderName: "You", content: "Hello John! Thanks for reaching out. Could you tell me more about your project?", timestamp: "Yesterday, 3:15 PM", isRead: true, isClient: false },
        { id: "3", sender: "client", senderName: "John Mwangi", content: "We need an e-commerce platform for our retail business", timestamp: "Yesterday, 3:30 PM", isRead: true, isClient: true },
        { id: "4", sender: "company", senderName: "You", content: "I've sent over a proposal. Please take a look and let me know your thoughts.", timestamp: "Today, 9:00 AM", isRead: true, isClient: false },
        { id: "5", sender: "client", senderName: "John Mwangi", content: "Thanks for the proposal, I'll review it", timestamp: "10:30 AM", isRead: false, isClient: true },
      ]
    },
    {
      id: "2",
      clientName: "Sarah Wanjiku",
      clientCompany: "Creative Agency",
      lastMessage: "When can we schedule a meeting?",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
      avatar: "SW",
      messages: [
        { id: "1", sender: "client", senderName: "Sarah Wanjiku", content: "Hello! Love your portfolio. Do you do branding work?", timestamp: "Yesterday, 11:00 AM", isRead: true, isClient: true },
        { id: "2", sender: "company", senderName: "You", content: "Yes, we specialize in brand identity and strategy", timestamp: "Yesterday, 11:30 AM", isRead: true, isClient: false },
        { id: "3", sender: "client", senderName: "Sarah Wanjiku", content: "When can we schedule a meeting?", timestamp: "Yesterday, 2:00 PM", isRead: true, isClient: true },
      ]
    }
  ])

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentConversation) return
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "company",
      senderName: "You",
      content: newMessage,
      timestamp: "Just now",
      isRead: true,
      isClient: false
    }
    
    const updatedConversations = conversations.map(c => {
      if (c.id === selectedConversation) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: newMessage,
          lastMessageTime: "Just now"
        }
      }
      return c
    })
    
    setConversations(updatedConversations)
    setNewMessage("")
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Messages</h1>
          <p className="text-slate-500 mt-1 text-sm">Communicate with potential and existing clients</p>
        </div>
      </div>

      <div className="h-[calc(100vh-120px)] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition border-b border-slate-100 ${
                  selectedConversation === conv.id ? "bg-teal-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold flex-shrink-0">
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-slate-900 truncate">{conv.clientName}</p>
                      <p className="text-xs text-slate-400 flex-shrink-0">{conv.lastMessageTime}</p>
                    </div>
                    <p className="text-xs text-slate-500">{conv.clientCompany}</p>
                    <p className="text-sm text-slate-600 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {currentConversation ? (
          <div className="flex-1 flex flex-col bg-slate-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold">
                    {currentConversation.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{currentConversation.clientName}</p>
                    <p className="text-xs text-slate-500">{currentConversation.clientCompany}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <Phone className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <Video className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <MoreVertical className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isClient ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] ${msg.isClient ? "bg-white" : "bg-teal-600 text-white"} rounded-lg p-3 shadow-sm`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isClient ? "text-slate-400" : "text-teal-100"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
