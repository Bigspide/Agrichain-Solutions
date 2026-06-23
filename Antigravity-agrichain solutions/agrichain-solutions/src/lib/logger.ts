import { format, transports, createLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Configure winston format
const logFormat = format.combine(
  // Add timestamp to each log entry
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add color to the level based on the level
  format.colorize({ all: true }),
  // Format the log message
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define which transports to use based on environment
const transportsConfig = [
  // Console transport for all environments
  new transports.Console({
    format: logFormat,
  }),
];

// Add file transport in production
if (process.env.NODE_ENV !== 'development') {
  transportsConfig.push(
    new DailyRotateFile({
      filename: 'logs/%DATE%-agrichain.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
    })
  );
}

// Create the logger instance
const logger = createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports: transportsConfig,
  exitOnError: false, // Do not exit on handled errors
});

// Create a stream object for Morgan HTTP middleware
logger.stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export the logger
export default logger;

// Export helper functions for specific log types
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Create a logger with a specific namespace
export const createNamespaceLogger = (namespace: string) => {
  return {
    error: (message: string, meta?: any) => logger.error(`[${namespace}] ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`[${namespace}] ${message}`, meta),
    info: (message: string, meta?: any) => logger.info(`[${namespace}] ${message}`, meta),
    http: (message: string, meta?: any) => logger.http(`[${namespace}] ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`[${namespace}] ${message}`, meta),
  };
};
