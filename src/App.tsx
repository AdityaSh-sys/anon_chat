import { useRef, useEffect, useState } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { RoomCreator } from './components/RoomCreator';
import { RoomInvite } from './components/RoomInvite';
import { useChat } from './hooks/useChat';

function App() {
  const [roomId, setRoomId] = useState<string>('');
  const [showInvite, setShowInvite] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for room ID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const { 
    messages, 
    currentUser, 
    currentRoom, 
    isConnected, 
    sendMessage, 
    createNewRoom, 
    leaveCurrentRoom, 
    formatRelativeTime 
  } = useChat(roomId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update roomId when room is created
  useEffect(() => {
    if (currentRoom && currentRoom.id !== roomId) {
      setRoomId(currentRoom.id);
      setShowInvite(true);
    }
  }, [currentRoom, roomId]);

  // Reset state when room is left or closed
  useEffect(() => {
    if (!currentRoom) {
      setRoomId('');
      setShowInvite(false);
    }
  }, [currentRoom]);

  const handleCreateRoom = () => {
    createNewRoom();
  };

  const handleJoinRoom = (joinRoomId: string) => {
    setRoomId(joinRoomId);
  };

  const handleLeaveRoom = () => {
    console.log('Leave room button clicked');
    leaveCurrentRoom();
    // State will be reset by the useEffect above when currentRoom becomes null
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentRoom) {
    return <RoomCreator onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative flex flex-col h-screen">
        <ChatHeader 
          username={currentUser.username} 
          messageCount={messages.length}
          roomId={currentRoom.id}
          participantCount={currentRoom.participants.length}
          isConnected={isConnected}
          onLeaveRoom={handleLeaveRoom}
        />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-white/80 text-lg font-medium mb-2">Room is ready!</h3>
                <p className="text-white/60 text-sm">
                  {currentRoom.participants.length === 1 
                    ? "Waiting for someone to join... Share the room link to start chatting!"
                    : "Start the conversation! Messages will automatically delete after 10 minutes."
                  }
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    formatTime={formatRelativeTime}
                    isOwn={message.userId === currentUser.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        <ChatInput 
          onSendMessage={sendMessage} 
          isConnected={isConnected}
        />
      </div>

      {showInvite && currentRoom && (
        <RoomInvite
          roomId={currentRoom.id}
          username={currentUser.username}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}

export default App;