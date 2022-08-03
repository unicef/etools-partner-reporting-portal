// server/app.js
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
const app = express();

// Serve static assets
app.use(express.static(path.resolve(__dirname, 'build/id-management/bundled')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  console.log(req.url);
  console.log(req.headers);
  res.sendFile(path.resolve(__dirname, 'build/id-management/bundled', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});