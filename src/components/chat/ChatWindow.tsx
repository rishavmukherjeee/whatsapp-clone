"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Smile } from 'lucide-react';
import { Message } from '@/types/message';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface ChatWindowProps {
  messages: Message[];
  selectedContact: {
    wa_id: string;
    contact_name: string;
  } | null;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export default function ChatWindow({ 
  messages, 
  selectedContact, 
  onSendMessage,
  isLoading 
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedContact) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleEmojiSelect = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string, isIncoming: boolean) => {
    if (isIncoming) return null;
    // WhatsApp-style SVG ticks using provided paths
    switch (status) {
      case 'sent':
        return (
          <svg width="20" height="16" viewBox="0 0 20 16" style={{display: 'inline', verticalAlign: 'middle'}}>
            <path d="M2 6 L6 10 L14 2" stroke="#999999" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'delivered':
        return (
          <span style={{display: 'inline-flex', alignItems: 'center'}}>
            <svg width="20" height="16" viewBox="0 0 20 16" style={{display: 'inline', verticalAlign: 'middle', marginRight: -8}}>
              <path d="M2 6 L6 10 L14 2" stroke="#999999" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6 L10 10 L18 2" stroke="#999999" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        );
      case 'read':
        return (
          <span style={{display: 'inline-flex', alignItems: 'center'}}>
            <svg width="20" height="16" viewBox="0 0 20 16" style={{display: 'inline', verticalAlign: 'middle', marginRight: -8}}>
              <path d="M2 6 L6 10 L14 2" stroke="#4FC3F7" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6 L10 10 L18 2" stroke="#4FC3F7" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{background: 'var(--background)'}}>
        <div className="text-center" style={{color: 'var(--foreground)'}}>
          <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center" style={{background: '#222d35'}}>
            <svg className="w-16 h-16" style={{color: '#8696a0'}} fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-2">WhatsApp Web</h2>
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex-1 flex flex-col" style={{background: 'var(--background)', color: 'var(--foreground)'}}>
      {/* Header */}
      <div className="border-b p-4" style={{background: 'var(--sidebar-header-bg)', borderBottom: '1px solid var(--sidebar-border)'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{background: '#2a3942'}}>
              <span className="text-lg font-medium" style={{color: 'var(--sidebar-fg)', border: '2px solid #53bdeb', borderRadius: '50%', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {selectedContact.contact_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-medium" style={{color: 'var(--sidebar-fg)'}}>
                {selectedContact.contact_name}
              </h2>
              <p className="text-sm" style={{color: '#8696a0'}}>
                {selectedContact.wa_id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-[#222d35] transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#222d35] transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#222d35] transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-background" style={{background: 'var(--background)'}}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 rounded-lg shadow-sm text-xs" style={{background: '#2a3942', color: '#8696a0'}}>
                  {date}
                </div>
              </div>
              {/* Messages for this date */}
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isIncoming ? 'justify-start' : 'justify-end'} mb-2`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isIncoming
                        ? 'bg-[#202c33] text-[#e9edef] shadow-sm'
                        : 'bg-[#005c4b] text-[#e9edef]'
                    }`}
                  >
                    <p className="break-words">{message.text}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                      message.isIncoming ? 'text-gray-500' : 'text-green-100'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {getStatusIcon(message.status, message.isIncoming)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input */}
      <div className="border-t p-4" style={{background: 'var(--sidebar-header-bg)', borderTop: '1px solid var(--sidebar-border)'}}>
        {showEmojiPicker && (
          <div style={{position: 'absolute', bottom: 60, left: 20, zIndex: 1000}}>
            <EmojiPicker onEmojiClick={handleEmojiSelect} theme={Theme.DARK} />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-[#222d35] transition-colors"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile className="w-6 h-6 text-gray-500" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{
                background: '#202c33',
                color: '#e9edef',
                border: '1px solid #222d35'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-[#222d35] text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}