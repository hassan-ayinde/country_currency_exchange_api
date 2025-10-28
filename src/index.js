// src/index.js
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const countriesRouter = require('./routes/countries');
const { sync } = require('./models/index');

app.use(express.json());
app.use('/countries', countriesRouter);

// global error fallback for JSON responses
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

sync().then(() => {
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}).catch(err => {
  console.error('Failed to start', err);
});
