const fetch = global.fetch;
const tests = [
  {
    email: 'aryan0133be23@chitkara.edu.in',
    name: 'aryan singhal',
    rollNo: '2310990133',
    accessCode: 'EXfvDp',
    clientID: '840f87bf-c515-4341-8d94-25bf0075e23e',
    clientSecret: 'tihKNqJDZpYMmSdr'
  },
  {
    email: 'aryan0133.be23@chitkara.edu.in',
    name: 'aryan singhal',
    rollNo: '2310990133',
    accessCode: 'EXfvDp',
    clientID: '840f87bf-c515-4341-8d94-25bf0075e23e',
    clientSecret: 'tihKNqJDZpYMmSdr'
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