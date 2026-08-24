const http = require('http');
http.get('http://localhost:5173', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Fetched:', data.length));
}).on('error', (err) => console.log('Error:', err.message));
