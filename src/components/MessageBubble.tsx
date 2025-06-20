import React from 'react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
  formatTime: (timestamp: number) => string;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, formatTime, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
        isOwn ? 'order-2' : 'order-1'
      }`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-md border border-white/20'
        } shadow-lg hover:shadow-xl transition-all duration-200`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.username}
            </span>
            <span className={`text-xs ${
              isOwn ? 'text-blue-200' : 'text-gray-400'
            }`}>
              {formatTime(message.timestamp)}
            </span>
          </div>
          <p className="text-sm leading-relaxed break-words">{message.text}</p>
        </div>
      </div>
    </div>
  );
};