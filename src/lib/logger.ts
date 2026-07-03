import pino from "pino";

const SENSITIVE_KEYS = new Set([
  "token", "password", "secret", "key", "authorization",
  "card_number", "cvv", "card_expire", "bank",
]);

function redactSensitiveData(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = redactSensitiveData(value as Record<string, unknown>, depth + 1);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? redactSensitiveData(item as Record<string, unknown>, depth + 1)
          : item,
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

const logger = pino({
  level: LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "errBody.token",
      "errBody.password",
      "errBody.card_number",
    ],
    censor: "[REDACTED]",
  },
});

function logWithRedact(level: "debug" | "info" | "warn" | "error", msg: string, data?: Record<string, unknown>, context: string) {
  const safeData = data ? redactSensitiveData(data) : undefined;
  logger[level]({ ...safeData, context }, msg);
}

export function createLogger(context: string) {
  return {
    debug: (msg: string, data?: Record<string, unknown>) => logWithRedact("debug", msg, data, context),
    info: (msg: string, data?: Record<string, unknown>) => logWithRedact("info", msg, data, context),
    warn: (msg: string, data?: Record<string, unknown>) => logWithRedact("warn", msg, data, context),
    error: (msg: string, data?: Record<string, unknown>) => logWithRedact("error", msg, data, context),
    redacted: (msg: string, data: Record<string, unknown>) => {
      logger.error({ ...redactSensitiveData(data), context, redacted: true }, msg);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
