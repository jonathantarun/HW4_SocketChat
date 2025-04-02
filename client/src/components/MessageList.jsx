import React, { useEffect, useRef, useState, useMemo } from 'react';
import MessageReactions from './MessageReactions';

function MessageList({ messages, usersJoined, usersLeft, currentUser, onAddReaction }) {
  const messagesEndRef = useRef(null);
  const [displayedJoins, setDisplayedJoins] = useState(new Set());
  const [displayedLeaves, setDisplayedLeaves] = useState(new Set());

  // Memoize processed joins to avoid unnecessary recalculations
  const processedJoins = useMemo(() => {
    return usersJoined.filter(user => {
      if (!user.id || displayedJoins.has(user.id)) return false;
      return true;
    });
  }, [usersJoined, displayedJoins]);

  // Memoize processed leaves
  const processedLeaves = useMemo(() => {
    return usersLeft.filter(user => {
      if (!user.id || displayedLeaves.has(user.id)) return false;
      return true;
    });
  }, [usersLeft, displayedLeaves]);

  // Update our tracking sets when we display new joins/leaves
  useEffect(() => {
    if (processedJoins.length > 0) {
      setDisplayedJoins(prev => {
        const newSet = new Set(prev);
        processedJoins.forEach(user => {
          if (user.id) newSet.add(user.id);
        });
        return newSet;
      });
    }
    
    if (processedLeaves.length > 0) {
      setDisplayedLeaves(prev => {
        const newSet = new Set(prev);
        processedLeaves.forEach(user => {
          if (user.id) newSet.add(user.id);
        });
        return newSet;
      });
    }
  }, [processedJoins, processedLeaves]); // now depend on memoized values

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages update or new join/leave events are processed
  useEffect(() => {
    scrollToBottom();
  }, [messages, processedJoins, processedLeaves]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Safe check if a message is from the current user
  const isOwnMessage = (msg) => {
    if (!currentUser || !msg) return false;
    return msg.senderId === currentUser.id || msg.sender === currentUser.username;
  };

  return (
    <div className="message-list">
      {/* System messages for joining users */}
      {processedJoins.map((user, index) => (
        <div key={`join-${user.id || index}`} className="system-message">
          <span>{user.username} joined the chat</span>
          <span className="message-time">{formatTime(user.timestamp)}</span>
        </div>
      ))}
      
      {/* System messages for users who left */}
      {processedLeaves.map((user, index) => (
        <div key={`left-${user.id || index}`} className="system-message left-message">
          <span>{user.username} left the chat</span>
          <span className="message-time">{formatTime(user.timestamp)}</span>
        </div>
      ))}
      
      {/* Regular messages */}
      {messages.map((msg, index) => (
        <div key={msg.id || `msg-${index}`} className={`message ${isOwnMessage(msg) ? 'own-message' : ''}`}>
          <div className="message-header">
            <span className="message-sender">{msg.sender} </span>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
          </div>
          <div className="message-content">{msg.text}</div>
          <MessageReactions 
            message={msg} 
            onAddReaction={onAddReaction}
            currentUser={currentUser || { id: null, username: '' }}
          />
        </div>
      ))}
      
      {/* This div is for auto-scrolling to the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
