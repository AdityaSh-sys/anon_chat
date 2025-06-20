import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, createReadStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory storage for rooms (no persistent storage)
const rooms = new Map();
const userConnections = new Map();

// Message expiration time (10 minutes)
const MESSAGE_LIFETIME = 10 * 60 * 1000;

// Clean up expired messages every minute
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    room.messages = room.messages.filter(msg => now - msg.timestamp < MESSAGE_LIFETIME);
    
    // Remove empty rooms with no active connections
    if (room.connections.size === 0 && room.messages.length === 0) {
      rooms.delete(roomId);
    }
  }
}, 60000);

// Create HTTP server for serving static files in production
const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      rooms: rooms.size,
      connections: userConnections.size 
    }));
    return;
  }

  // // Default response
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  // res.end('Anonymous Chat WebSocket Server Running');
// Serve built frontend from /dist
const filePath = join(__dirname, '../dist/index.html');
if (req.url === '/' || req.url === '/index.html') {
  if (existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Frontend not built. Please run "npm run build"');
  }
  return;
}

});

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let userId = null;
  let currentRoomId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message.type, message);
      
      switch (message.type) {
        case 'join_room':
          handleJoinRoom(ws, message);
          break;
        case 'leave_room':
          handleLeaveRoom(ws, message);
          break;
        case 'send_message':
          handleSendMessage(ws, message);
          break;
        case 'create_room':
          handleCreateRoom(ws, message);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed for user:', userId);
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
    
    console.log('Creating room:', roomId, 'for user:', user.username);
    
    // Create new room
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
    
    console.log('User joining room:', user.username, 'to room:', roomId);
    
    let room = rooms.get(roomId);
    
    if (!room) {
      // Create room if it doesn't exist
      room = {
        id: roomId,
        participants: [user],
        messages: [],
        connections: new Set([ws]),
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      rooms.set(roomId, room);
      console.log('Created new room:', roomId);
    } else {
      // Add user to existing room
      const existingUser = room.participants.find(p => p.id === user.id);
      if (!existingUser) {
        room.participants.push(user);
        console.log('Added user to existing room. Participants:', room.participants.length);
      }
      room.connections.add(ws);
      room.lastActivity = Date.now();
    }
    
    userConnections.set(userId, { ws, roomId, user });
    
    // Send room data to joining user
    ws.send(JSON.stringify({
      type: 'room_joined',
      roomId,
      room: {
        id: roomId,
        participants: room.participants,
        messages: room.messages.filter(msg => Date.now() - msg.timestamp < MESSAGE_LIFETIME)
      }
    }));
    
    // Notify other participants
    broadcastToRoom(roomId, {
      type: 'user_joined',
      user,
      participants: room.participants
    }, ws);
  }

  function handleLeaveRoom(ws, message) {
    const { roomId, userId: messageUserId } = message;
    const targetUserId = messageUserId || userId;
    
    console.log('User leaving room:', targetUserId, 'from room:', roomId);
    
    const room = rooms.get(roomId);
    if (!room) {
      console.log('Room not found:', roomId);
      return;
    }
    
    // Remove user from room participants
    const initialParticipantCount = room.participants.length;
    room.participants = room.participants.filter(p => p.id !== targetUserId);
    room.connections.delete(ws);
    
    console.log('Participants before:', initialParticipantCount, 'after:', room.participants.length);
    
    // Remove user connection
    userConnections.delete(targetUserId);
    
    // Always close the room when someone leaves (as per the app's design)
    console.log('Closing room due to user leaving:', roomId);
    
    // Notify all participants that room is closing
    broadcastToRoom(roomId, {
      type: 'room_closed',
      reason: 'participant_left',
      message: 'Room closed because a participant left'
    });
    
    // Close all remaining connections in this room
    for (const connection of room.connections) {
      if (connection.readyState === 1) { // WebSocket.OPEN
        try {
          connection.send(JSON.stringify({
            type: 'room_closed',
            reason: 'participant_left'
          }));
        } catch (error) {
          console.error('Error sending room_closed message:', error);
        }
      }
    }
    
    // Delete the room completely
    rooms.delete(roomId);
    console.log('Room deleted:', roomId, 'Remaining rooms:', rooms.size);
    
    // Reset current user's room tracking
    if (targetUserId === userId) {
      currentRoomId = null;
    }
  }

  function handleSendMessage(ws, message) {
    const { roomId, messageData } = message;
    const room = rooms.get(roomId);
    
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      return;
    }
    
    const newMessage = {
      ...messageData,
      timestamp: Date.now()
    };
    
    room.messages.push(newMessage);
    room.lastActivity = Date.now();
    
    // Broadcast message to all participants
    broadcastToRoom(roomId, {
      type: 'new_message',
      message: newMessage
    });
  }

  function broadcastToRoom(roomId, data, excludeWs = null) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const message = JSON.stringify(data);
    console.log('Broadcasting to room:', roomId, 'message type:', data.type, 'connections:', room.connections.size);
    
    for (const connection of room.connections) {
      if (connection !== excludeWs && connection.readyState === 1) {
        try {
          connection.send(message);
        } catch (error) {
          console.error('Error broadcasting message:', error);
          // Remove failed connection
          room.connections.delete(connection);
        }
      }
    }
  }
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Anonymous Chat Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});