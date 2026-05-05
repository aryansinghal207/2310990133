const body = {
  email: "aryan0133be23@chitkara.edu.in",
  name: "aryan singhal",
  mobileNo: "8727976531",
  githubUsername: "https://github.com/aryansinghal207/",
  rollNo: "2310990133",
  accessCode: "EXfvDp",
  clientID: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET"
};

fetch('http://20.207.122.201/evaluation-service/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
})
.then(response => response.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(error => console.error('Error:', error));