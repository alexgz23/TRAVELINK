import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logDir = process.env.LOG_DIR || 'logs';
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Formato personalizado para logs
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

/**
 * Formato para desarrollo (más legible)
 */
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('ViajeroConectado', {
    colors: true,
    prettyPrint: true,
  }),
);

/**
 * Transport para consola
 */
const consoleTransport = new winston.transports.Console({
  format: isDevelopment ? devFormat : customFormat,
  level: isDevelopment ? 'debug' : 'info',
});

/**
 * Transport para errores (archivo con rotación diaria)
 */
const errorFileTransport: DailyRotateFile = new DailyRotateFile({
  dirname: `${logDir}/errors`,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: customFormat,
});

/**
 * Transport para logs combinados (archivo con rotación diaria)
 */
const combinedFileTransport: DailyRotateFile = new DailyRotateFile({
  dirname: `${logDir}/combined`,
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: customFormat,
});

/**
 * Transport para logs de debug (solo en desarrollo)
 */
const debugFileTransport: DailyRotateFile = new DailyRotateFile({
  dirname: `${logDir}/debug`,
  filename: 'debug-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'debug',
  format: customFormat,
});

/**
 * Configuración de Winston
 */
export const winstonConfig: winston.LoggerOptions = {
  level: isDevelopment ? 'debug' : 'info',
  format: customFormat,
  transports: [
    consoleTransport,
    ...(isDevelopment ? [debugFileTransport] : []),
    errorFileTransport,
    combinedFileTransport,
  ],
  exceptionHandlers: [
    new winston.transports.File({
      dirname: logDir,
      filename: 'exceptions.log',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      dirname: logDir,
      filename: 'rejections.log',
    }),
  ],
};

/**
 * Niveles de log personalizados
 */
export const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Colores para los niveles de log
 */
export const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);
