const PRIORITY_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

async function getPriorityInbox(token, limit = 10) {
  try {
    const response = await fetch('http://20.207.122.201/evaluation-service/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const notifications = data.notifications || [];

    // Sort by priority (descending) then by timestamp (descending - most recent first)
    const sortedNotifications = notifications.sort((a, b) => {
      const priorityA = PRIORITY_WEIGHTS[a.Type] || 0;
      const priorityB = PRIORITY_WEIGHTS[b.Type] || 0;

      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }

      // If same priority, sort by timestamp (most recent first)
      const timeA = new Date(a.Timestamp);
      const timeB = new Date(b.Timestamp);
      return timeB - timeA;
    });

    // Return top N notifications
    return sortedNotifications.slice(0, limit);
  } catch (error) {
    console.error('Error fetching priority inbox:', error);
    throw error;
  }
}

// Main execution
async function main() {
  // Replace with actual token
  const token = process.env.ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhcnlhbjAxMzNiZTIzQGNoaXRrYXJhLmVkdS5pbiIsImV4cCI6MTc3Nzk2MTUxMSwiaWF0IjoxNzc3OTYwNjExLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZTg2ZDZhOTQtNmZkOS00ZWJkLTg4ZGEtOTdmMjIxYmJkOGE0IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYXJ5YW4gc2luZ2hhbCIsInN1YiI6Ijg0MGY4N2JmLWM1MTUtNDM0MS04ZDk0LTI1YmYwMDc1ZTIzZSJ9LCJlbWFpbCI6ImFyeWFuMDEzM2JlMjNAY2hpdGthcmEuZWR1LmluIiwibmFtZSI6ImFyeWFuIHNpbmdoYWwiLCJyb2xsTm8iOiIyMzFvOTlvMTMzIiwiYWNjZXNzQ29kZSI6IkVYZnZEcCIsImNsaWVudElEIjoiODQwZjg3YmYtYzUxNS00MzQxLThkOTQtMjViZjAwNzVlMjNlIiwiY2xpZW50U2VjcmV0IjoidHJoS05xSkRacFlNbVNkciJ9._awHGxS5d07xUyGTkjRTLTD825NsVX0jW-msZnCOfzA';

  try {
    const topNotifications = await getPriorityInbox(token, 10);

    console.log('Top 10 Priority Notifications:');
    console.log('================================');
    topNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.Type}] ${notif.Message}`);
      console.log(`   ID: ${notif.ID}`);
      console.log(`   Timestamp: ${notif.Timestamp}`);
      console.log('---');
    });

    console.log(`\nTotal notifications processed: ${topNotifications.length}`);
  } catch (error) {
    console.error('Failed to get priority inbox:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getPriorityInbox, PRIORITY_WEIGHTS };