/**
 * Structured JSON logger for production.
 * Outputs one JSON line per log entry.
 * No PII in logs (no email, phone, names).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ??
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function write(level: LogLevel, message: string, extra?: Record<string, unknown>) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...extra,
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

export const logger = {
  debug(message: string, extra?: Record<string, unknown>) {
    write('debug', message, extra);
  },
  info(message: string, extra?: Record<string, unknown>) {
    write('info', message, extra);
  },
  warn(message: string, extra?: Record<string, unknown>) {
    write('warn', message, extra);
  },
  error(message: string, extra?: Record<string, unknown>) {
    write('error', message, extra);
  },
};
