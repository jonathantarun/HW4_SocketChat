import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

// Store connected users
const users = {};
// Store messages with their reactions
const messages = [];

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  
  // Send existing messages to newly connected user
  socket.emit('init_messages', messages);
  
  // User registration
  socket.on('register_user', (username) => {
    users[socket.id] = {
      username,
      id: socket.id,
      joinedAt: new Date()
    };
    
    console.log(`User registered: ${username}`);
    
    // Broadcast to all users that someone has joined
    io.emit('user_joined', {
      username,
      id: socket.id,
      timestamp: new Date()
    });
  });
  
  // Handle chat messages
  socket.on('chat message', (messageData) => {
    // Add sender information and timestamp
    const enhancedMessage = {
      ...messageData,
      id: messageData.id || Date.now().toString(), // Ensure we have an ID
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date(),
      reactions: {} // Initialize empty reactions object
    };
    
    // Store the message
    messages.push(enhancedMessage);
    
    io.emit('chat message', enhancedMessage);
  });

  socket.on('add_reaction', (data) => {
    // Find the message in our stored messages
    const messageIndex = messages.findIndex(msg => msg.id === data.messageId);
    
    if (messageIndex !== -1) {
      const message = messages[messageIndex];
      
      // Initialize reaction array if it doesn't exist
      if (!message.reactions[data.reaction]) {
        message.reactions[data.reaction] = [];
      }
      
      // Check if user already reacted with this emoji
      const existingReactionIndex = message.reactions[data.reaction].findIndex(
        reaction => reaction.userId === socket.id
      );
      
      if (existingReactionIndex === -1) {
        // Add new reaction
        message.reactions[data.reaction].push({
          userId: socket.id,
          username: users[socket.id]?.username || 'Anonymous'
        });
      } else {
        // Remove existing reaction (toggle behavior)
        message.reactions[data.reaction].splice(existingReactionIndex, 1);
        
        // If no reactions of this type left, remove the key
        if (message.reactions[data.reaction].length === 0) {
          delete message.reactions[data.reaction];
        }
      }
      
      // Update the message in our array
      messages[messageIndex] = message;
      
      // Broadcast updated reactions to all clients
      io.emit('update_reactions', {
        messageId: data.messageId,
        reactions: message.reactions
      });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', () => {
    if (users[socket.id]) {
      socket.broadcast.emit('user_typing', {
        username: users[socket.id].username,
        id: socket.id
      });
    }
  });
  
  // Handle stop typing
  socket.on('stop typing', () => {
    socket.broadcast.emit('user_stop_typing', {
      id: socket.id
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      io.emit('user_left', {
        username: users[socket.id].username,
        id: socket.id,
        timestamp: new Date()
      });
      
      delete users[socket.id];
    }
    console.log('user disconnected');
  });
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});