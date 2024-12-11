import BaseCronJob from "./BaseCronJob.js";
import logger from "../utils/logger.js";

export default class DemoCron extends BaseCronJob {
  constructor() {
    super("DemoCron");
    this.cronTime = "0 */5 * * * *";
    this.description = "A demo cron";
  }

  execute() {
    logger.info(`${this.name} execution started.`);

    try {
      // Your specific job logic here
      logger.info(`${this.name} execution completed.`);
    } catch (error) {
      logger.error(`${this.name} error: ${error.message}`);
    }
  }
}
