# Chat room - using Client/Server programming

This project is based on the Socket.io tutorial `https://socket.io/docs/v4/tutorial/step-5` until step 5, the front end is then build using react and vite. It is a chat room where people can join (register) using their names and then send messages. Everyone else in the room can also read and react to those messages.

## Instructions to run

1. Clone the repository - either with
   - ``` git clone https://github.com/jonathantarun/HW4_SocketChat.git ```
   - ``` git clone git@github.com:jonathantarun/HW4_SocketChat.git ```
2. Navigate to the project directory in the terminal
3. Run ```npm install```
4. Run ```cd server``` and then ```npm start```
5. Open another terminal at the project directory and run ```cd client``` then run ```npm run dev```
6. Paste this link into your browser `http://localhost:5173/` (or if a different link shows up on the terminal as Local : *link* , use that link)
7. Register as a user and send messages.
8. To act as a different user, repeat from step 6 in a separate tab.

## Demo Video
[Click here](https://youtu.be/G5jAfl75nII) to watch my video on this assignment!

## Creative Addition

1. List of Online Users (There is a bug so I added a new addition)
2. Message Reactions - allows users to react to anyone's message using some emojis.
3. Typing Indicator - Shows who is typing.
4. The colors of other users will be highlighted.

## AI Usage

1. - Model: ChatGPT-o3 mini
   - Prompt: I'm having an issue with the currently online users in my chatroom assignment, it only shows the users that connect after me, it does not show me the prviously online users. Can you help me correct this. *my code*
   - Response: Try re-emitting your stored online users when a user registers.

   Tried it, it kept breaking my app when a new user registers.

2. - Model: ChatGPT-o3 mini
   - Prompt: Can you write the css code for this chat room application. *chat room jsx code*
   - Response:

   ```css
   .message-reactions {
    padding-top: 0.5rem;
    font-size: 0.9rem;
    }
    
    .reaction-buttons {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
    }
    
    .reaction-button {
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      padding: 2px 5px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .reaction-button:hover {
      background-color: #f0f0f0;
    }
    
    .reaction-button.active {
      background-color: #e1f5fe;
    }
    
    .reaction-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    
    .reaction-badge {
      display: flex;
      align-items: center;
      background-color: #785fdd;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.8rem;
    }
    
    .reaction-emoji {
      margin-right: 4px;
    }
    
    .reaction-count {
      font-weight: bold;
    }
    
    /* Adjust existing message styles for reactions */
    .message {
      padding: 0.75rem;
      border-radius: 8px;
      max-width: 70%;
      margin-bottom: 0.5rem;
    }

3. - Model: ChatGPT-o3 mini
   - Prompt: Can you add a Typing Indicator component that shows the chat room who is currently typing.
   - Response:

    ```js
    socket.on('typing', () => {
    if (users[socket.id]) {
      socket.broadcast.emit('user_typing', {
        username: users[socket.id].username,
        id: socket.id
      });
    }
    });
    ``` 
     TypingIndicator.jsx:

    ```jsx
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
    ```
