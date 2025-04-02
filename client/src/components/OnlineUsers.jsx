import { useState, useEffect } from 'react';

function OnlineUsers({ usersJoined = [], usersLeft = [], currentUser }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    setOnlineUsers((prev) => {
      // Start with the previous online users list
      const newUsers = [...prev];

      // Add any new joined users that aren't already in the list
      usersJoined.forEach((user) => {
        if (!newUsers.find((u) => u.id === user.id)) {
          newUsers.push(user);
        }
      });

      // Remove any users who have left
      return newUsers.filter(
        (user) => !usersLeft.find((leftUser) => leftUser.id === user.id)
      );
    });
  }, [usersJoined, usersLeft]);

  // Determine the current username from the currentUser prop,
  // whether it's a string or an object
  const currentUsername =
    typeof currentUser === 'object' ? currentUser.username : currentUser;

  return (
    <div className="online-users">
      <h3>Online Users</h3>
      {onlineUsers.length > 0 ? (
        <ul>
          {onlineUsers.map((user) => (
            <li key={user.id}>
              {user.username} {user.username === currentUsername ? '(You)' : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users online.</p>
      )}
    </div>
  );
}

export default OnlineUsers;