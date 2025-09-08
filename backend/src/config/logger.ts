import winston from "winston";
import "winston-daily-rotate-file";

// Define transports for different log types
const appLogTransport = new winston.transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "info",
});

// Define transports for http log types
const requestLogTransport = new winston.transports.DailyRotateFile({
  filename: "logs/requests-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "http",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format((info) => {
      return info.level === "http" ? info : false;
    })()
  ),
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Log to console in development
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      level: "debug",
    }),
    appLogTransport,
    requestLogTransport,
  ],
});

export default logger;
