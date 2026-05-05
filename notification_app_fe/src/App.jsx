import { useState, useEffect } from 'react';
import Log from './Log';
import './App.css';

const PRIORITY_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

function App() {
  const [view, setView] = useState('all'); // 'all' or 'priority'
  const [notifications, setNotifications] = useState([]);
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewedIds, setViewedIds] = useState(new Set(JSON.parse(localStorage.getItem('viewedNotifications') || '[]')));

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://20.207.122.201/evaluation-service/notifications', {
        headers: {
          'Authorization': `Bearer ${window.ACCESS_TOKEN}`
        }
      });
      const data = await response.json();
      const notifs = data.notifications || [];
      setNotifications(notifs);

      // Calculate priority notifications
      const sorted = notifs.sort((a, b) => {
        const priorityA = PRIORITY_WEIGHTS[a.Type] || 0;
        const priorityB = PRIORITY_WEIGHTS[b.Type] || 0;
        if (priorityA !== priorityB) return priorityB - priorityA;
        return new Date(b.Timestamp) - new Date(a.Timestamp);
      });
      setPriorityNotifications(sorted.slice(0, 10));

      Log('frontend', 'info', 'api', `Fetched ${notifs.length} notifications`);
    } catch (error) {
      Log('frontend', 'error', 'api', `Failed to fetch notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = (id) => {
    const newViewed = new Set(viewedIds);
    newViewed.add(id);
    setViewedIds(newViewed);
    localStorage.setItem('viewedNotifications', JSON.stringify([...newViewed]));
  };

  const NotificationItem = ({ notif }) => {
    const isViewed = viewedIds.has(notif.ID);
    return (
      <div
        className={`notification ${isViewed ? 'viewed' : 'new'}`}
        onClick={() => markAsViewed(notif.ID)}
      >
        <div className="type">{notif.Type}</div>
        <div className="message">{notif.Message}</div>
        <div className="timestamp">{new Date(notif.Timestamp).toLocaleString()}</div>
        <div className="id">{notif.ID}</div>
      </div>
    );
  };

  return (
    <div className="app">
      <header>
        <h1>Campus Notification Platform</h1>
        <nav>
          <button onClick={() => setView('all')} className={view === 'all' ? 'active' : ''}>
            All Notifications
          </button>
          <button onClick={() => setView('priority')} className={view === 'priority' ? 'active' : ''}>
            Priority Inbox
          </button>
        </nav>
      </header>

      <main>
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : (
          <div className="notification-list">
            {(view === 'all' ? notifications : priorityNotifications).map(notif => (
              <NotificationItem key={notif.ID} notif={notif} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;