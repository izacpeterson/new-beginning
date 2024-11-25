const express = require("express");
const routes = require("./routes");
const { port } = require("./config.js");
const logger = require("./utils/logger.js");
const session = require("express-session");

const app = express();
app.set("trust proxy", true);

app.use(express.json());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
    },
  })
);

app.use((req, res, next) => {
  const loggedIn = req.session?.loggedIn || false;
  const allowedIp = "76.8.219.118"; // Replace with the correct IP you want to allow

  // Normalize the IP address
  let clientIp = req.ip;
  if (clientIp === "::1") {
    clientIp = "127.0.0.1"; // Convert IPv6 loopback to IPv4 for consistency
  }

  // Check if the IP is allowed
  const isAllowedIp = clientIp === allowedIp || clientIp === "127.0.0.1";

  let dir;
  if (loggedIn) {
    dir = "public/home";
  } else {
    dir = "public/login";
  }

  express.static(dir)(req, res, next);
});

app.use("/api", auth);

// app.use("/", express.static("public"));

function auth(req, res, next) {
  if (req.query.key == process.env.API_KEY || req.body.key == process.env.API_KEY || req.session.loggedIn) {
    next();
    return;
  } else {
    // logger.error('Unauthorized request attempted');
    res.send({ msg: "NO AUTH" });
  }
}

app.use("/api", routes);

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

module.exports = app;
