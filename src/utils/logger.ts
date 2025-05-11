// src/utils/logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info', // Change to 'debug' for more verbosity
  format: format.combine(
    format.timestamp(),
    format.json() // Log in JSON format
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ],
});

export default logger;