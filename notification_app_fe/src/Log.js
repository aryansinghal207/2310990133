// Log function for frontend
const Log = async (stack, level, pkg, message) => {
  const token = import.meta.env.VITE_ACCESS_TOKEN || window.ACCESS_TOKEN;
  if (!token) {
    console.error('ACCESS_TOKEN not set');
    return;
  }

  try {
    const response = await fetch('http://20.207.122.201/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stack, level, package: pkg, message })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Log sent:', data);
    } else {
      console.error('Log failed:', data);
    }
  } catch (error) {
    console.error('Error sending log:', error);
  }
};

export default Log;