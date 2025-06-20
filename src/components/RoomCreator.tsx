import React, { useState } from 'react';
import { Plus, Copy, Check } from 'lucide-react';

interface RoomCreatorProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export const RoomCreator: React.FC<RoomCreatorProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      onJoinRoom(joinRoomId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Anonymous Chat</h1>
            <p className="text-white/70">Create or join a temporary chat room</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onCreateRoom}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 hover:bg-blue-600 
                       text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 
                       active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create New Chat Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white/70">or</span>
              </div>
            </div>

            {!showJoinForm ? (
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-medium 
                         rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
              >
                Join Existing Room
              </button>
            ) : (
              <form onSubmit={handleJoinRoom} className="space-y-3">
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter room ID..."
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl 
                           text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 
                           focus:border-transparent transition-all duration-200"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!joinRoomId.trim()}
                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium 
                             rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join Room
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false);
                      setJoinRoomId('');
                    }}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium 
                             rounded-xl transition-all duration-200 border border-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-medium mb-2">How it works:</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Create a room and share the link with someone</li>
              <li>• Messages auto-delete after 10 minutes</li>
              <li>• Room closes when anyone leaves</li>
              <li>• Completely anonymous conversations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};