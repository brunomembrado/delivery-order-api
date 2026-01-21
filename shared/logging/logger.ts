import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

interface LogMeta {
  [key: string]: unknown;
}

const customFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }

  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

const createLogger = (serviceName: string) => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: serviceName },
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
    transports: [
      new winston.transports.Console({
        format: combine(colorize(), customFormat),
      }),
    ],
  });

  if (process.env.NODE_ENV === 'production') {
    logger.add(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(timestamp(), winston.format.json()),
      })
    );
    logger.add(
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: combine(timestamp(), winston.format.json()),
      })
    );
  }

  return logger;
};

export class Logger {
  private logger: winston.Logger;

  constructor(serviceName: string) {
    this.logger = createLogger(serviceName);
  }

  info(message: string, meta?: LogMeta): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: LogMeta): void {
    if (error instanceof Error) {
      this.logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
      this.logger.error(message, { error, ...meta });
    }
  }

  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(message, meta);
  }

  http(message: string, meta?: LogMeta): void {
    this.logger.http(message, meta);
  }
}

export const createServiceLogger = (serviceName: string): Logger => {
  return new Logger(serviceName);
};
