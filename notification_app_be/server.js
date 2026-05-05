const express = require('express');
const { Log } = require('../logging_middleware');

const app = express();
app.use(express.json());
process.env.ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhcnlhbjAxMzNiZTIzQGNoaXRrYXJhLmVkdS5pbiIsImV4cCI6MTc3Nzk2MTUxMSwiaWF0IjoxNzc3OTYwNjExLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZTg2ZDZhOTQtNmZkOS00ZWJkLTg4ZGEtOTdmMjIxYmJkOGE0IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYXJ5YW4gc2luZ2hhbCIsInN1YiI6Ijg0MGY4N2JmLWM1MTUtNDM0MS04ZDk0LTI1YmYwMDc1ZTIzZSJ9LCJlbWFpbCI6ImFyeWFuMDEzM2JlMjNAY2hpdGthcmEuZWR1LmluIiwibmFtZSI6ImFyeWFuIHNpbmdoYWwiLCJyb2xsTm8iOiIyMzFvOTlvMTMzIiwiYWNjZXNzQ29kZSI6IkVYZnZEcCIsImNsaWVudElEIjoiODQwZjg3YmYtYzUxNS00MzQxLThkOTQtMjViZjAwNzVlMjNlIiwiY2xpZW50U2VjcmV0IjoidHJoS05xSkRacFlNbVNkciJ9._awHGxS5d07xUyGTkjRTLTD825NsVX0jW-msZnCOfzA';

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

const PORT = 3000;
app.listen(PORT, () => {
  Log('backend', 'info', 'service', `Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});