const express = require("express");
const routes = require("./routes");
const { port } = require("./config.js");
const logger = require("./utils/logger.js");

const app = express();

app.use(express.json());
app.use(express.static("public"));

function auth(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Normalize the IP address (Express may return '::1' for IPv6 localhost)
  const normalizedIp = clientIp.replace("::ffff:", "");

  // Define localhost IP addresses
  const localhostIps = ["127.0.0.1", "::1"];

  // Check if the request is from localhost
  if (localhostIps.includes(normalizedIp)) {
    next();
    return;
  }
  if (req.query.key == "izac") {
    next();
    return;
  } else {
    // logger.error('Unauthorized request attempted');
    res.send({ msg: "NO AUTH" });
  }
}

// app.use(auth);

app.use("/api", routes);

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

module.exports = app;
