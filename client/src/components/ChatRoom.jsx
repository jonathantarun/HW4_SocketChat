import { useState, useEffect } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import OnlineUsers from './OnlineUsers';
import TypingIndicator from './TypingIndicator';

function ChatRoom({ socket, username }) {
  const [messages, setMessages] = useState([]);
  const [usersJoined, setUsersJoined] = useState([]);
  const [usersLeft, setUsersLeft] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [currentUser, setCurrentUser] = useState({ username, id: null });

  useEffect(() => {
    // Only register once when the component mounts
    if (socket && username) {
      socket.emit('register_user', username);
      console.log("Registering user:", username);
      
      // Set current user with initial data
      setCurrentUser(prev => ({
        ...prev,
        username
      }));
    }

    // Listen for any init_messages event (for stored messages)
    socket.on('init_messages', (initialMessages) => {
      console.log("Received initial messages:", initialMessages);
      setMessages(initialMessages);
    });

    socket.on('current_users', (users) => {
      console.log("Current users:", users);
      // Replace the entire usersJoined array with the current users
      // This prevents duplicates
      setUsersJoined(users);
    });

    // Handle incoming messages
    socket.on('chat message', (message) => {
      console.log("Received message:", message);
      // Ensure message has reactions property initialized
      const messageWithReactions = {
        ...message,
        reactions: message.reactions || {}
      };
      setMessages((prevMessages) => [...prevMessages, messageWithReactions]);
    });
    
    // Handle reaction updates from server
    socket.on('update_reactions', ({ messageId, reactions }) => {
      console.log("Reaction update:", messageId, reactions);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, reactions } : msg
        )
      );
    });
    
    // Maintain backward compatibility with message_reaction event
    socket.on('message_reaction', (reactionData) => {
      console.log("Message reaction:", reactionData);
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === reactionData.messageId) {
            // Create or update reactions for this message
            const updatedReactions = msg.reactions ? { ...msg.reactions } : {};

            
            // Use reaction emoji as key, store array of users who reacted
            if (!updatedReactions[reactionData.reaction]) {
              updatedReactions[reactionData.reaction] = [];
            }
            
            // Check if user already reacted with this emoji
            const userIndex = updatedReactions[reactionData.reaction]
              .findIndex(user => user.userId === reactionData.userId);
              
            if (userIndex === -1) {
              // Add new reaction
              updatedReactions[reactionData.reaction].push({
                username: reactionData.username,
                userId: reactionData.userId
              });
            } else {
              // User already reacted with this emoji, so remove it (toggle behavior)
              updatedReactions[reactionData.reaction].splice(userIndex, 1);
              
              // If no users are left for this reaction, remove the emoji key
              if (updatedReactions[reactionData.reaction].length === 0) {
                delete updatedReactions[reactionData.reaction];
              }
            }
            
            return { ...msg, reactions: updatedReactions };
          }
          return msg;
        })
      );
    });

    // Handle user joined notifications
    socket.on('user_joined', (userData) => {
      console.log("User joined:", userData);
      
      // Check if this user is already in our list to avoid duplicates
      setUsersJoined((prevUsers) => {
        // Only add if the user isn't already in the list
        const userExists = prevUsers.some(user => user.id === userData.id);
        if (userExists) {
          return prevUsers;
        }
        return [...prevUsers, userData];
      });
      
      // Update current user if this is us joining
      if (userData.username === username) {
        console.log("Setting current user ID:", userData.id);
        setCurrentUser(prev => ({
          ...prev,
          id: userData.id
        }));
      }
    });
    
    // Handle user left notifications
    socket.on('user_left', (userData) => {
      console.log("User left:", userData);
      setUsersLeft((prevUsers) => {
        // Check if this event is already recorded
        const alreadyLeft = prevUsers.some(user => user.id === userData.id);
        if (alreadyLeft) {
          return prevUsers;
        }
        return [...prevUsers, userData];
      });
      
      // Also remove from usersJoined list
      setUsersJoined(prevUsers => 
        prevUsers.filter(user => user.id !== userData.id)
      );
    });
    
    // Handle typing indicators
    socket.on('user_typing', (userData) => {
      setTypingUsers((prev) => ({ ...prev, [userData.id]: userData }));
    });
    
    socket.on('user_stop_typing', (userData) => {
      setTypingUsers((prev) => {
        const newState = { ...prev };
        delete newState[userData.id];
        return newState;
      });
    });
    
    // Cleanup on component unmount
    return () => {
      socket.off('init_messages');
      socket.off('current_users');
      socket.off('chat message');
      socket.off('update_reactions');
      socket.off('message_reaction');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, username]); // Only depend on socket and username
  
  const sendMessage = (messageText) => {
    if (messageText.trim()) {
      // Generate a unique ID for the message
      const messageId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
      socket.emit('chat message', { 
        id: messageId,
        text: messageText 
      });
    }
  };
  
  const addReaction = (messageId, reaction) => {
    socket.emit('add_reaction', {
      messageId,
      reaction
    });
  };

  const handleTyping = () => {
    socket.emit('typing');
  };
  
  const handleStopTyping = () => {
    socket.emit('stop typing');
  };
  
  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <OnlineUsers 
          usersJoined={usersJoined} 
          usersLeft={usersLeft} 
          currentUser={username} 
        />
      </div>
      
      <div className="chat-main">
        <MessageList 
          messages={messages} 
          usersJoined={usersJoined}
          usersLeft={usersLeft}
          currentUser={currentUser}
          onAddReaction={addReaction}
        />
        
        <TypingIndicator typingUsers={typingUsers} />
        
        <MessageInput 
          onSendMessage={sendMessage} 
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      </div>
    </div>
  );
}

export default ChatRoom;