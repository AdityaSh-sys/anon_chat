import { useState, useEffect, useCallback } from 'react';
import { Message, User } from '../types/chat';
import { generateUsername } from '../utils/username';
import { useWebSocket } from './useWebSocket';

export const useChat = (roomId?: string) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const {
    isConnected,
    currentRoom,
    messages,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage
  } = useWebSocket();

  // Initialize user
  useEffect(() => {
    const user: User = {
      id: crypto.randomUUID(),
      username: generateUsername()
    };
    setCurrentUser(user);
    console.log('Generated user:', user);
  }, []);

  // Auto-join room if roomId is provided
  useEffect(() => {
    if (currentUser && roomId && isConnected && !currentRoom) {
      console.log('Auto-joining room:', roomId, 'for user:', currentUser);
      joinRoom(roomId, currentUser);
    }
  }, [currentUser, roomId, isConnected, currentRoom, joinRoom]);

  const createNewRoom = useCallback((): string => {
    if (!currentUser || !isConnected) {
      console.log('Cannot create room - user or connection not ready');
      return '';
    }
    
    console.log('Creating new room for user:', currentUser);
    createRoom(currentUser);
    return 'creating...'; // Room ID will be provided by server
  }, [currentUser, isConnected, createRoom]);

  const sendMessage = useCallback((text: string) => {
    if (!currentUser || !currentRoom || !text.trim()) {
      console.log('Cannot send message - missing requirements');
      return;
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      username: currentUser.username,
      timestamp: Date.now(),
      userId: currentUser.id
    };

    console.log('Sending message:', newMessage);
    sendChatMessage(currentRoom.id, newMessage);
  }, [currentUser, currentRoom, sendChatMessage]);

  const leaveCurrentRoom = useCallback(() => {
    if (!currentUser || !currentRoom) {
      console.log('Cannot leave room - no user or room');
      return;
    }
    
    console.log('User leaving current room:', { 
      userId: currentUser.id, 
      username: currentUser.username,
      roomId: currentRoom.id 
    });
    
    leaveRoom(currentRoom.id, currentUser.id);
  }, [currentUser, currentRoom, leaveRoom]);

  const formatRelativeTime = useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor(diff / 1000);

    if (minutes > 0) {
      return `${minutes}m ago`;
    } else if (seconds > 0) {
      return `${seconds}s ago`;
    } else {
      return 'now';
    }
  }, []);

  return {
    messages,
    currentUser,
    currentRoom,
    isConnected,
    sendMessage,
    createNewRoom,
    leaveCurrentRoom,
    formatRelativeTime
  };
};