const logger = require("./utils/logger.js");
const { startAllJobs, stopAllJobs } = require("./jobs");

function startApp() {
  logger.info("Starting application...");
  startAllJobs();
}
startApp();

require("./sandbox.js");
require("./server.js");
