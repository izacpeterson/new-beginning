const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

// Define your custom log format
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (Object.keys(metadata).length !== 0) {
    msg += JSON.stringify(metadata);
  }

  return msg;
});

// Create the logger instance
const logger = createLogger({
  level: "info", // Set the default logging level
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(), // Adds color to the console output
    customFormat
  ),
  transports: [
    new transports.Console(),
    // You can add more transports, such as File transport, if needed
    new transports.File({ filename: "./logs/app.log" }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

module.exports = logger;
