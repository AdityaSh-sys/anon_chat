import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';
import mime from 'mime';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory storage
const rooms = new Map();
const userConnections = new Map();
const MESSAGE_LIFETIME = 10 * 60 * 1000;

// Cleanup old messages
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    room.messages = room.messages.filter(msg => now - msg.timestamp < MESSAGE_LIFETIME);
    if (room.connections.size === 0 && room.messages.length === 0) {
      rooms.delete(roomId);
    }
  }
}, 60000);

// Server
const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      rooms: rooms.size,
      connections: userConnections.size
    }));
    return;
  }

  // Serve frontend
  const staticDir = join(__dirname, '../dist');
  let requestedPath = req.url.split('?')[0];
  let filePath = join(staticDir, requestedPath === '/' ? 'index.html' : requestedPath);

  try {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': mime.getType(filePath) || 'text/plain' });
      createReadStream(filePath).pipe(res);
    } else {
      const fallback = join(staticDir, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      createReadStream(fallback).pipe(res);
    }
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// WebSocket setup
const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  let userId = null;
  let currentRoomId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      switch (message.type) {
        case 'join_room': handleJoinRoom(ws, message); break;
        case 'leave_room': handleLeaveRoom(ws, message); break;
        case 'send_message': handleSendMessage(ws, message); break;
        case 'create_room': handleCreateRoom(ws, message); break;
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    if (userId && currentRoomId) {
      handleLeaveRoom(ws, { roomId: currentRoomId, userId });
    }
    userConnections.delete(userId);
  });

  function handleCreateRoom(ws, message) {
    const { user } = message;
    const roomId = generateRoomId();
    userId = user.id;
    currentRoomId = roomId;

    rooms.set(roomId, {
      id: roomId,
      participants: [user],
      messages: [],
      connections: new Set([ws]),
      createdAt: Date.now(),
      lastActivity: Date.now()
    });

    userConnections.set(userId, { ws, roomId, user });

    ws.send(JSON.stringify({
      type: 'room_created',
      roomId,
      room: {
        id: roomId,
        participants: [user],
        messages: []
      }
    }));
  }

  function handleJoinRoom(ws, message) {
    const { roomId, user } = message;
    userId = user.id;
    currentRoomId = roomId;

    let room = rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        participants: [user],
        messages: [],
        connections: new Set([ws]),
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      rooms.set(roomId, room);
    } else {
      if (!room.participants.find(p => p.id === user.id)) {
        room.participants.push(user);
      }
      room.connections.add(ws);
    }

    userConnections.set(userId, { ws, roomId, user });

    ws.send(JSON.stringify({
      type: 'room_joined',
      roomId,
      room: {
        id: roomId,
        participants: room.participants,
        messages: room.messages.filter(msg => Date.now() - msg.timestamp < MESSAGE_LIFETIME)
      }
    }));

    broadcastToRoom(roomId, {
      type: 'user_joined',
      user,
      participants: room.participants
    }, ws);
  }

  function handleLeaveRoom(ws, message) {
    const { roomId, userId: messageUserId } = message;
    const targetUserId = messageUserId || userId;
    const room = rooms.get(roomId);
    if (!room) return;

    room.participants = room.participants.filter(p => p.id !== targetUserId);
    room.connections.delete(ws);
    userConnections.delete(targetUserId);

    broadcastToRoom(roomId, {
      type: 'room_closed',
      reason: 'participant_left',
    });

    for (const connection of room.connections) {
      if (connection.readyState === 1) {
        connection.send(JSON.stringify({
          type: 'room_closed',
          reason: 'participant_left'
        }));
      }
    }

    rooms.delete(roomId);
    if (targetUserId === userId) currentRoomId = null;
  }

  function handleSendMessage(ws, message) {
    const { roomId, messageData } = message;
    const room = rooms.get(roomId);
    if (!room) return ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));

    const newMessage = { ...messageData, timestamp: Date.now() };
    room.messages.push(newMessage);
    broadcastToRoom(roomId, { type: 'new_message', message: newMessage });
  }

  function broadcastToRoom(roomId, data, excludeWs = null) {
    const room = rooms.get(roomId);
    if (!room) return;
    const message = JSON.stringify(data);
    for (const connection of room.connections) {
      if (connection !== excludeWs && connection.readyState === 1) {
        connection.send(message);
      }
    }
  }
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Error logging
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Anonymous Chat Server running on port ${PORT}`);
  console.log(`✅ WebSocket server ready for connections`);
});
