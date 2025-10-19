// backend/index.js
// ✅ Express + React integration server

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Enable CORS
app.use(cors());

// ✅ Serve static React build
app.use(express.static(path.join(__dirname, '../client/build')));

// ✅ Example API route (optional)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running fine!' });
});

// ✅ Fallback route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
