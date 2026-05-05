const express = require('express');
const { Log } = require('../logging_middleware');

const app = express();
app.use(express.json());

if (!process.env.ACCESS_TOKEN) {
  console.warn('Warning: ACCESS_TOKEN is not set. Logs will fail unless it is configured in the environment.');
}

app.get('/test', (req, res) => {
  Log('backend', 'info', 'route', 'Test route accessed');
  res.json({ message: 'Test successful' });
});

app.post('/notification', (req, res) => {
  const { title, message } = req.body;
  Log('backend', 'info', 'handler', `Creating notification: ${title}`);
  if (!title) {
    Log('backend', 'error', 'handler', 'Title is required');
    return res.status(400).json({ error: 'Title is required' });
  }
  Log('backend', 'info', 'service', 'Notification created successfully');
  res.json({ id: Date.now(), title, message });
});

const PORT = 3001;
app.listen(PORT, () => {
  Log('backend', 'info', 'service', `Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});