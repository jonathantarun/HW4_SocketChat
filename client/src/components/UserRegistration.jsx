import { useState } from 'react';

function UserRegistration({ onRegister }) {
  const [username, setUsername] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onRegister(username);
    }
  };
  
  return (
    <div className="registration-container">
      <h2>Join the Chat</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}

export default UserRegistration;