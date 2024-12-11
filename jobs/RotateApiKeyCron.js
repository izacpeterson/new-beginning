import BaseCronJob from "./BaseCronJob.js";
import logger from "../utils/logger.js";
import * as auth from "../utils/auth.js";

export default class RotateApiKey extends BaseCronJob {
  constructor() {
    super("Rotate Api Key");
    this.cronTime = "0 0 0 1 * *";
    this.description = "Generates a new API key. WARNING: it will override the old one";
  }

  async execute() {
    logger.info(`${this.name} execution started.`);

    try {
      let key = await auth.generateNewApiKey();
      logger.info(`API KEY: ${key}`);
      logger.info(`${this.name} execution completed.`);
    } catch (error) {
      logger.error(`${this.name} error: ${error.message}`);
    }
  }
}
