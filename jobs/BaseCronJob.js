// jobs/BaseCronJob.js

const { CronJob } = require("cron");
const logger = require("../utils/logger");

class BaseCronJob {
  constructor(name = "BaseCronJob") {
    this.job = null;
    this.name = name;
    this.cronTime = null; // Will be defined in derived classes
    this.lastExecutionTime = null; // To store the last execution time
  }

  start() {
    if (this.job) {
      logger.warn(`${this.name} is already running.`);
      return;
    }

    if (!this.cronTime) {
      logger.error(`Cron time not defined for ${this.name}.`);
      return;
    }

    this.job = new CronJob(
      this.cronTime,
      () => {
        this.execute();
        this.lastExecutionTime = new Date(); // Update last execution time
      },
      null,
      true, // Start the job immediately
      "America/Denver" // Specify your time zone if needed
    );

    logger.info(`${this.name} started with cron expression: ${this.cronTime}`);
  }

  execute() {
    logger.info(`${this.name} execution started.`);

    try {
      // Placeholder for job logic
      logger.info(`${this.name} execution completed.`);
    } catch (error) {
      logger.error(`${this.name} error: ${error.message}`);
    }
  }

  forceExecute() {
    logger.info(`${this.name} force execution started.`);

    try {
      this.execute();
      this.lastExecutionTime = new Date(); // Update last execution time
      logger.info(`${this.name} force execution completed.`);
    } catch (error) {
      logger.error(`${this.name} force execution error: ${error.message}`);
    }
  }

  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      logger.info(`${this.name} stopped.`);
    } else {
      logger.warn(`${this.name} is not running.`);
    }
  }

  isRunning() {
    return this.job && this.job.running;
  }

  status() {
    const isRunning = this.isRunning();
    const lastExecution = this.lastExecutionTime;
    const nextExecution = isRunning && this.job ? this.job.nextDates() : null;

    return {
      name: this.name,
      isRunning: isRunning,
      cronTime: this.cronTime,
      lastExecution: lastExecution ? lastExecution.toLocaleString() : null,
      nextExecution: nextExecution ? nextExecution.toLocaleString() : null,
    };
  }
}

module.exports = BaseCronJob;
