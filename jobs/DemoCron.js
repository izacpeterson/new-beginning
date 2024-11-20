const BaseCronJob = require('./BaseCronJob');
const logger = require('../utils/logger');

class DemoCron extends BaseCronJob {
  constructor() {
    super('DemoCron');
    this.cronTime = '0 */5 * * * *';
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

module.exports = DemoCron;
