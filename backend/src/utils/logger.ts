type LogLevel = "INFO" | "WARN" | "ERROR";

function formatMeta(meta?: Record<string, unknown>) {
  if (!meta || Object.keys(meta).length === 0) {
    return "";
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return " [unserializable-meta]";
  }
}

function writeLog(level: LogLevel, scope: string, message: string, meta?: Record<string, unknown>) {
  const line = `[${new Date().toISOString()}] ${level} ${scope}: ${message}${formatMeta(meta)}`;

  if (level === "ERROR") {
    console.error(line);
    return;
  }

  if (level === "WARN") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info(scope: string, message: string, meta?: Record<string, unknown>) {
    writeLog("INFO", scope, message, meta);
  },
  warn(scope: string, message: string, meta?: Record<string, unknown>) {
    writeLog("WARN", scope, message, meta);
  },
  error(scope: string, message: string, meta?: Record<string, unknown>) {
    writeLog("ERROR", scope, message, meta);
  },
};
