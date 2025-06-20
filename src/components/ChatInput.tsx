import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  isConnected: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled, 
  isConnected 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && isConnected) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const isDisabled = disabled || !isConnected;

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/10 backdrop-blur-md border-t border-white/20">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type your anonymous message..." : "Connecting..."}
            disabled={isDisabled}
            className="w-full px-4 py-3 pr-12 bg-white/80 backdrop-blur-sm border border-white/30 rounded-full 
                     text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 
                     focus:border-transparent transition-all duration-200 disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim() || isDisabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full
                     hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                     hover:scale-105 active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </form>
  );
};