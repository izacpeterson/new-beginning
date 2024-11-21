const express = require("express");
const router = express.Router();
const path = require("path");
const session = require("express-session");

router.post("/login", (req, res) => {
  req.session.loggedIn = true;

  res.send({ success: true });
});

module.exports = router;
