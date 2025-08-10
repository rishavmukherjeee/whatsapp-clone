'use client';

import { useState, useEffect } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import MobileLayout from '@/components/chat/MobileLayout';
import { Conversation, Message } from '@/types/message';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        const formattedConversations: Conversation[] = data.map((conv: any) => ({
          wa_id: conv._id,
          contact_name: conv.contact_name,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          messages: []
        }));
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for specific conversation
  const fetchMessages = async (wa_id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?wa_id=${wa_id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process webhook payloads
  const processPayloads = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/process-payloads', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Payload processing result:', result);
        // Refresh conversations after processing
        await fetchConversations();
      } else {
        console.error('Error processing payloads');
      }
    } catch (error) {
      console.error('Error processing payloads:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Send new message
  const sendMessage = async (text: string) => {
    if (!selectedConversation) return;

    const selectedContact = conversations.find(c => c.wa_id === selectedConversation);
    if (!selectedContact) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          wa_id: selectedConversation,
          contact_name: selectedContact.contact_name
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        
        // Update conversations list
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (wa_id: string) => {
    setSelectedConversation(wa_id);
    fetchMessages(wa_id);
  };

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const selectedContact = conversations.find(c => c.wa_id === selectedConversation);

  return (
    <>
      {/* Desktop Layout */}
      <div className="h-screen md:flex bg-gray-100 hidden">
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onProcessPayloads={processPayloads}
          isProcessing={isProcessing}
        />
        <ChatWindow
          messages={messages}
          selectedContact={selectedContact ? {
            wa_id: selectedContact.wa_id,
            contact_name: selectedContact.contact_name
          } : null}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Mobile Layout */}
      <MobileLayout
        conversations={conversations}
        selectedConversation={selectedConversation}
        messages={messages}
        onSelectConversation={handleSelectConversation}
        onSendMessage={sendMessage}
        onProcessPayloads={processPayloads}
        isProcessing={isProcessing}
        isLoading={isLoading}
      />
    </>
  );
}