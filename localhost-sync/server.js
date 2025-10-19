// ✅ server.js - Local sync server
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/sync-order', (req, res) => {
  const newOrder = req.body;
  console.log('✅ Incoming Order:', newOrder);

  const kotFile = './kot.json';
  let kotList = [];

  if (fs.existsSync(kotFile)) {
    kotList = JSON.parse(fs.readFileSync(kotFile, 'utf-8'));
  }

  kotList.push(newOrder);
  fs.writeFileSync(kotFile, JSON.stringify(kotList, null, 2));

  return res.json({ success: true, message: '✅ Order synced to local KOT' });
});

app.listen(PORT, () => {
  console.log(`🖥️ Local KOT server running at http://localhost:${PORT}`);
});
