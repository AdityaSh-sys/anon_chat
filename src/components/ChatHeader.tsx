import React from 'react';
import { MessageCircle, Timer, Users, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { ConnectionStatus } from './ConnectionStatus';

interface ChatHeaderProps {
  username: string;
  messageCount: number;
  roomId: string;
  participantCount: number;
  isConnected: boolean;
  onLeaveRoom: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  username, 
  messageCount, 
  roomId, 
  participantCount,
  isConnected,
  onLeaveRoom 
}) => {
  const [copied, setCopied] = useState(false);
  
  const copyRoomId = async () => {
    try {
      const inviteUrl = `${window.location.origin}?room=${roomId}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <MessageCircle className="text-blue-300" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Anonymous Chat</h1>
            <div className="flex items-center gap-2">
              <p className="text-blue-200 text-sm">Room: {roomId}</p>
              <ConnectionStatus isConnected={isConnected} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-white/80">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span className="text-sm">{participantCount} online</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer size={16} />
            <span className="text-sm">{messageCount} messages</span>
          </div>
          
          <button
            onClick={copyRoomId}
            disabled={!isConnected}
            className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg 
                     transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 
                     text-red-200 rounded-lg transition-all duration-200 text-sm"
          >
            <LogOut size={14} />
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};