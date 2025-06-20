import React, { useState } from 'react';
import { Copy, Check, Share2, X } from 'lucide-react';

interface RoomInviteProps {
  roomId: string;
  username: string;
  onClose: () => void;
}

export const RoomInvite: React.FC<RoomInviteProps> = ({ roomId, username, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const inviteUrl = `${window.location.origin}?room=${roomId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my anonymous chat',
          text: `${username} invited you to an anonymous chat room`,
          url: inviteUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            <Share2 className="text-blue-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Room Created!</h2>
          <p className="text-gray-600">Share this link to invite someone to your anonymous chat</p>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs text-gray-500 mb-1">Room ID</p>
            <p className="font-mono text-sm text-gray-800 break-all">{roomId}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs text-gray-500 mb-1">Invite Link</p>
            <p className="font-mono text-xs text-gray-800 break-all">{inviteUrl}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 
                       text-white font-medium rounded-xl transition-all duration-200"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {navigator.share && (
              <button
                onClick={shareNatively}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium 
                         rounded-xl transition-all duration-200"
              >
                <Share2 size={16} />
              </button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              The room will close automatically when either person leaves
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};