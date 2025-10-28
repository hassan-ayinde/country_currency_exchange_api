// src/index.js
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const countriesRouter = require("./routes/countries");
const { sync } = require("./models/index");

app.use(express.json());
app.use("/countries", countriesRouter);

// global error fallback for JSON responses
app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

sync()
  .then((ok) => {
    if (!ok) {
      console.warn("Starting server without DB connection (degraded mode)");
    }
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  })
  .catch((err) => {
    // This should be rare because sync() now returns false on failure,
    // but keep a safety net to log unexpected errors.
    console.error("Failed to start", err);
    process.exit(1);
  });
