import logger from "./utils/logger.js";
import { startAllJobs, stopAllJobs } from "./jobs/index.js";

function startApp() {
  logger.info("Starting application...");
  // startAllJobs();
}
startApp();

import "./server.js";

import "./sandbox.js";
