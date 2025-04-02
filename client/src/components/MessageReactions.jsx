import React from 'react';

function MessageReactions({ message, onAddReaction, currentUser }) {
  // Common emoji reactions
  const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '👏'];
  
  const handleReactionClick = (reaction) => {
    onAddReaction(message.id, reaction);
  };
  
  // Get counts for each reaction
  const getReactionCounts = () => {
    const counts = {};
    const reactions = message.reactions || {};
    
    Object.keys(reactions).forEach((emoji) => {
      counts[emoji] = reactions[emoji].length;
    });
    
    return counts;
  };
  
  // Check if current user has already reacted with a specific emoji
  const hasUserReacted = (emoji) => {
    if (!message.reactions || !message.reactions[emoji]) return false;
    
    return message.reactions[emoji].some(user => user.userId === currentUser?.id);
  };
  
  const reactionCounts = getReactionCounts();
  
  return (
    <div className="message-reactions">
      <div className="reaction-buttons">
        {availableReactions.map(emoji => (
          <button 
            key={emoji} 
            className={`reaction-button ${hasUserReacted(emoji) ? 'active' : ''}`}
            onClick={() => handleReactionClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      
      <div className="reaction-list">
        {Object.keys(reactionCounts).map(emoji => (
          reactionCounts[emoji] > 0 && (
            <div key={emoji} className="reaction-badge">
              <span className="reaction-emoji">{emoji}</span>
              <span className="reaction-count">{reactionCounts[emoji]}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default MessageReactions;