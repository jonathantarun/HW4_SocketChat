function TypingIndicator({ typingUsers }) {
    const typingUsersArray = Object.values(typingUsers);
    
    if (typingUsersArray.length === 0) {
        return null;
      }
      
      return (
        <div className="typing-indicator">
          {typingUsersArray.length === 1 ? (
            <p>{typingUsersArray[0].username} is typing...</p>
          ) : (
            <p>Several people are typing...</p>
          )}
        </div>
      );
  }
  
  export default TypingIndicator;