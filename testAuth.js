const fetch = global.fetch;
const tests = [
  {
    email: 'aryan0133be23@chitkara.edu.in',
    name: 'aryan singhal',
    rollNo: '2310990133',
    accessCode: 'EXfvDp',
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET'
  },
  {
    email: 'aryan0133.be23@chitkara.edu.in',
    name: 'aryan singhal',
    rollNo: '2310990133',
    accessCode: 'EXfvDp',
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET'
  }
];

(async () => {
  for (const body of tests) {
    const response = await fetch('http://20.207.122.201/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log('TEST', body.email, JSON.stringify(data));
  }
})();