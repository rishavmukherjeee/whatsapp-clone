'use client';

import { useState, useEffect } from 'react';
import { Search, MoreVertical, MessageCircle } from 'lucide-react';
import { Conversation } from '@/types/message';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (wa_id: string) => void;
  onProcessPayloads: () => void;
  isProcessing: boolean;
}

export default function ChatSidebar({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  onProcessPayloads,
  isProcessing 
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localConversations, setLocalConversations] = useState<Conversation[]>(conversations);

  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  const filteredConversations = localConversations.filter(conv =>
    conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.wa_id.includes(searchTerm)
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        day: '2-digit',
        month: '2-digit' 
      });
    }
  };

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="w-full md:w-96 flex flex-col h-full"
      style={{
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
        borderRight: '1px solid var(--sidebar-border)'
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{
          background: 'var(--sidebar-header-bg)',
          borderBottom: '1px solid var(--sidebar-border)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold" style={{color: 'var(--sidebar-fg)'}}>Chats</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onProcessPayloads}
              disabled={isProcessing}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Process Payloads"
            >
              <MessageCircle className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            style={{
              background: 'var(--sidebar-bg)',
              color: 'var(--sidebar-fg)',
              border: '1px solid var(--sidebar-border)'
            }}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64" style={{color: 'var(--sidebar-fg)'}}>
            <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm text-center px-4">
              Click "Process Payloads" to load sample conversations
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.wa_id}
              onClick={() => {
                onSelectConversation(conversation.wa_id);
                setLocalConversations(prev => prev.map(conv =>
                  conv.wa_id === conversation.wa_id ? { ...conv, unreadCount: 0 } : conv
                ));
              }}
              className={`flex items-center p-4 border-b cursor-pointer transition-colors ${
                selectedConversation === conversation.wa_id ? 'border-r-4 border-r-green-500' : ''
              }`}
              style={{
                background: selectedConversation === conversation.wa_id ? 'rgba(37,211,102,0.08)' : 'var(--sidebar-bg)',
                borderBottom: '1px solid var(--sidebar-border)',
                color: 'var(--sidebar-fg)'
              }}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{background: '#d1f0d7'}}>
                <span className="text-lg font-medium text-gray-600">
                  {conversation.contact_name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate" style={{color: 'var(--sidebar-fg)'}}>
                    {conversation.contact_name}
                  </h3>
                  <span className="text-xs flex-shrink-0 ml-2" style={{color: '#8696a0'}}>
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm truncate flex-1" style={{color: '#8696a0'}}>
                    {conversation.lastMessage.isIncoming ? '' : '✓ '}
                    {truncateMessage(conversation.lastMessage.text)}
                  </p>
                  
                  {conversation.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}