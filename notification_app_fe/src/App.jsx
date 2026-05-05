import { useState } from 'react';
import Log from './Log';

function App() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    Log('frontend', 'info', 'component', 'Submit button clicked');
    try {
      const response = await fetch('http://localhost:3000/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, message })
      });
      const data = await response.json();
      if (response.ok) {
        Log('frontend', 'info', 'api', 'Notification created successfully');
        setNotifications([...notifications, data]);
        setTitle('');
        setMessage('');
      } else {
        Log('frontend', 'error', 'api', `Failed to create notification: ${data.error}`);
      }
    } catch (error) {
      Log('frontend', 'error', 'api', `Error creating notification: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Notification App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Create Notification</button>
      </form>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>{notif.title}: {notif.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;