import winston from "winston";
import { logErrorToDB, logToDB } from "./db.js";

// Replace this URL with the one provided by your Slack app
const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

class SlackErrorTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.webhookUrl = opts.webhookUrl;
  }

  log(info, callback) {
    setImmediate(() => this.emit("logged", info));
    if (info.level === "error") {
      logErrorToDB(info.message);
      fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `:warning: *NODECODE Error Logged*\n*Message:* ${info.message}\n*Timestamp:* ${info.timestamp}`,
        }),
      }).catch((err) => {
        // Handle fetch errors (network issues, etc.)
        console.error("Failed to send Slack message:", err);
      });
    }

    callback();
  }
}

// Custom Transport for Logging to the Database
class DBTransport extends winston.Transport {
  log(info, callback) {
    setImmediate(() => this.emit("logged", info));
    logToDB({ level: info.level, message: info.message, timestamp: info.timestamp });
    callback();
  }
}

// Define a common log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}] : ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.uncolorize()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    }),
    new winston.transports.File({
      filename: "./logs/app.log",
      format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.uncolorize(), logFormat),
    }),
    new SlackErrorTransport({
      webhookUrl: SLACK_WEBHOOK_URL,
      level: "error", // Only error-level logs will be passed to this transport
    }),
    new DBTransport(), // Add the DBTransport here
  ],
});

// logger.info("Server listening on port 80");
// logger.info("Starting application...");
// logger.error("A sample error to test Slack webhook and DB logging");
// logger.error("Testing DB logging errors");

export default logger;
