import logger from "../utils/logger.js";
import DemoCron from "./DemoCron.js";
import HubSpotCron from "./HubSpotCron.js";
import RotateApiKey from "./RotateApiKeyCron.js";

const jobs = {};

function initializeJobs() {
  const demoCron = new DemoCron();
  jobs[demoCron.name] = demoCron;

  const hubSpotCron = new HubSpotCron();
  jobs[hubSpotCron.name] = hubSpotCron;

  const apiKeyCron = new RotateApiKey();
  jobs[apiKeyCron.name] = apiKeyCron;
}

function startAllJobs() {
  Object.values(jobs).forEach((job) => {
    if (!job.isRunning()) {
      job.start();
    } else {
      logger.warn(`${job.name} is already running.`);
    }
  });
  logger.info("All cron jobs have been started.");
}

function stopAllJobs() {
  Object.values(jobs).forEach((job) => job.stop());
  logger.info("All cron jobs have been stopped.");
}

function getAllJobs() {
  return Object.values(jobs);
}

function getJobByName(name) {
  return jobs[name];
}

// Initialize jobs when the module is loaded
initializeJobs();

export { startAllJobs, stopAllJobs, getAllJobs, getJobByName };
