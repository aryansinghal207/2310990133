const Log = async (stack, level, package, message) => {
  const token = process.env.ACCESS_TOKEN;
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
      body: JSON.stringify({ stack, level, package, message })
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

module.exports = { Log };