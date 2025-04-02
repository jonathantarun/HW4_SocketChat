import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatRoom from './components/ChatRoom';
import UserRegistration from './components/UserRegistration';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  
  useEffect(() => {
    // Handle connection status
    socket.on('connect', () => {
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);
  
  const handleUserRegistration = (username) => {
    if (username.trim()) {
      setUsername(username);
      socket.emit('register_user', username);
      setIsRegistered(true);
    }
  };
  
  return (
    <div className="app-container">
      <header>
        <h1>React Socket.io Chat</h1>
        <div className="connection-status">
          {isConnected ? 
            <span className="status-connected">Connected</span> : 
            <span className="status-disconnected">Disconnected</span>
          }
        </div>
      </header>
      
      <main>
        {!isRegistered ? (
          <UserRegistration onRegister={handleUserRegistration} />
        ) : (
          <ChatRoom socket={socket} username={username} />
        )}
      </main>
      
      <footer>
        <p>Socket.io Chat App with React + Vite</p>
      </footer>
    </div>
  );
}

export default App;