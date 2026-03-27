'use client';

import { useState } from 'react';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hi! How can we help you today?',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: 'Thank you for your message. Our team will respond shortly.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110',
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-card border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-xs text-primary-foreground/80">We typically reply in a few minutes</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary/20"
              onClick={() => setIsOpen(false)}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.isBot ? 'justify-start' : 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    message.isBot
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-4 flex items-center gap-2 bg-background">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button size="sm" onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default LiveChat;
