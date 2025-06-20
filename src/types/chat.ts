export interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: number;
  userId: string;
}

export interface User {
  id: string;
  username: string;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: number;
  lastActivity: number;
}

export interface RoomInvite {
  roomId: string;
  inviterUsername: string;
  createdAt: number;
}