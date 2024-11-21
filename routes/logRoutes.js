const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/", (req, res) => {
  const logFilePath = path.join(__dirname, "..", "logs", "app.log");

  let text = fs.readFileSync(path.join(__dirname, "..", "logs", "app.log"), "utf8");

  // Send the text as a JSON response
  res.setHeader("Content-Type", "text/plain");
  res.send(text);
});

module.exports = router;
