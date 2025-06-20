import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, User, ChatRoom } from '../types/chat';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Use Vite proxy path in development, direct WebSocket in production
    const wsUrl = import.meta.env.PROD 
      ? `wss://${window.location.host}/ws`
      : `ws://${window.location.host}/ws`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, []);

  const handleMessage = (data: WebSocketMessage) => {
    console.log('Received WebSocket message:', data.type, data);
    
    switch (data.type) {
      case 'room_created':
      case 'room_joined':
        console.log('Setting room and messages:', data.room);
        setCurrentRoom(data.room);
        setMessages(data.room.messages || []);
        break;
        
      case 'new_message':
        console.log('Adding new message:', data.message);
        setMessages(prev => [...prev, data.message]);
        break;
        
      case 'user_joined':
        console.log('User joined, updating participants:', data.participants);
        setCurrentRoom(prev => prev ? {
          ...prev,
          participants: data.participants
        } : null);
        break;
        
      case 'user_left':
        console.log('User left, updating participants:', data.participants);
        setCurrentRoom(prev => prev ? {
          ...prev,
          participants: data.participants
        } : null);
        break;
        
      case 'room_closed':
        console.log('Room closed, clearing all state. Reason:', data.reason);
        setCurrentRoom(null);
        setMessages([]);
        break;
        
      case 'error':
        console.error('Server error:', data.message);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending WebSocket message:', { type, ...payload });
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    } else {
      console.error('WebSocket not connected, cannot send message:', type);
    }
  }, []);

  const createRoom = useCallback((user: User) => {
    console.log('Creating room for user:', user);
    sendMessage('create_room', { user });
  }, [sendMessage]);

  const joinRoom = useCallback((roomId: string, user: User) => {
    console.log('Joining room:', roomId, 'with user:', user);
    sendMessage('join_room', { roomId, user });
  }, [sendMessage]);

  const leaveRoom = useCallback((roomId: string, userId: string) => {
    console.log('Leaving room - roomId:', roomId, 'userId:', userId);
    
    // Send leave message to server
    sendMessage('leave_room', { roomId, userId });
    
    // Immediately clear local state for instant UI feedback
    console.log('Clearing local state immediately');
    setCurrentRoom(null);
    setMessages([]);
  }, [sendMessage]);

  const sendChatMessage = useCallback((roomId: string, messageData: Message) => {
    console.log('Sending chat message to room:', roomId, messageData);
    sendMessage('send_message', { roomId, messageData });
  }, [sendMessage]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setCurrentRoom(null);
    setMessages([]);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    currentRoom,
    messages,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    connect,
    disconnect
  };
};