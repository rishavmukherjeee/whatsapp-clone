'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { Conversation, Message } from '@/types/message';

interface MobileLayoutProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  messages: Message[];
  onSelectConversation: (wa_id: string) => void;
  onSendMessage: (text: string) => void;
  onProcessPayloads: () => void;
  isProcessing: boolean;
  isLoading: boolean;
}

export default function MobileLayout({
  conversations,
  selectedConversation,
  messages,
  onSelectConversation,
  onSendMessage,
  onProcessPayloads,
  isProcessing,
  isLoading
}: MobileLayoutProps) {
  const [showChat, setShowChat] = useState(false);

  const handleSelectConversation = (wa_id: string) => {
    onSelectConversation(wa_id);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  const selectedContact = conversations.find(c => c.wa_id === selectedConversation);

  return (
    <div className="h-screen flex flex-col md:hidden">
      {!showChat ? (
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onProcessPayloads={onProcessPayloads}
          isProcessing={isProcessing}
        />
      ) : (
        <div className="flex flex-col h-full">
          {/* Mobile header with back button */}
          <div className="bg-green-600 text-white p-4 flex items-center">
            <button
              onClick={handleBackToList}
              className="mr-3 p-1 rounded-full hover:bg-green-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium">
                {selectedContact?.contact_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-medium">{selectedContact?.contact_name}</h2>
              <p className="text-sm text-green-100">{selectedContact?.wa_id}</p>
            </div>
          </div>
          
          {/* Chat content */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              messages={messages}
              selectedContact={selectedContact ? {
                wa_id: selectedContact.wa_id,
                contact_name: selectedContact.contact_name
              } : null}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}