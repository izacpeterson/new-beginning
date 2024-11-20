const logger = require("./utils/logger.js");
const { startAllJobs, stopAllJobs } = require("./jobs");

function startApp() {
  logger.info("Starting application...");
  startAllJobs();
}
startApp();

require("./server.js");
