import winston from "winston";
import { format } from "winston";
import "winston-daily-rotate-file";
import path from "path";

const { SPLAT } = require("triple-beam");
const PROJECT_ROOT = path.join(__dirname, "..");
const { combine, timestamp, label, printf } = format;

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "15d",
});

// tested following
// info("--------------");
// info("hello");
// info(1);
// info("hello", "one", "two");
// info("hello", 1, 2);
// info(1, "hello", 2);
// info("hello", { a: 1, b: 2 });
const myFormat = printf((args) => {
  const { level, message, label: labelLocal, timestamp: timestampLocal } = args;
  let finalMessage = message;
  const splats = args[SPLAT] || [];

  if (typeof message === "object") {
    finalMessage = JSON.stringify(message);
  }
  finalMessage +=
    splats.length === 0
      ? ""
      : `, ${splats
          .map((splat: any) =>
            typeof splat === "object" ? JSON.stringify(splat) : splat
          )
          .join(", ")}`;

  return `${timestampLocal} [${labelLocal}] ${level.toUpperCase()} - ${finalMessage}`;
});

const logger = winston.createLogger({
  level: "debug", // default log level, may want to on debug to see sql logs
  format: combine(
    label({ label: "API-LOG" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    // format.errors({ stack: true }),
    myFormat
  ),
  transports: [
    // new winston.transports.File(options.file),
    // new winston.transports.Console(options.console)
    transport,
  ],
  exitOnError: false, // do not exit on handled exceptions
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== "prod") {
logger.add(
  new winston.transports.Console({
    format: combine(label({ label: "API-LOG" }), timestamp(), myFormat),
  })
);
// }

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex: number) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  const stackList = new Error().stack?.split("\n").slice(3);

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  const s = stackList && (stackList[stackIndex] || stackList[0]);
  const sp = s && (stackReg.exec(s) || stackReg2.exec(s));

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stackList?.join("\n"),
    };
  }
  return {};
}

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments(
  argsParam: any[],
  isError: boolean | undefined
): string[] {
  const args = Array.prototype.slice.call(argsParam);

  const stackInfo = getStackInfo(1);

  if (stackInfo) {
    // get file path relative to project root
    const methodName = stackInfo.method ? `\\${stackInfo.method}` : "";
    const calleeStr = `(${stackInfo.relativePath}:${stackInfo.line}${methodName})`;

    if (typeof args[0] === "string") {
      args[0] = `${calleeStr} ${args[0]}`;
    } else if (typeof args[0] === "object" && !isError) {
      args[0] = `${calleeStr} ${JSON.stringify(args[0])}`;
    } else if (typeof args[0] === "object" && isError) {
      // error
      args[0] = `${calleeStr} ${args[0].message} : ${args[0].stack}`;
    } else {
      // args.unshift(calleeStr);
      args[0] = `${calleeStr} ${args[0]}`;
    }
  }

  return args;
}

// module.exports.logger = logger;

// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.
const debug = function (...args: any[]) {
  const formattedArgs = [...formatLogArguments(args, false)];
  logger.debug(formattedArgs[0], ...formattedArgs.splice(1));
};

const info = function (...args: any[]) {
  const formattedArgs = [...formatLogArguments(args, false)];
  logger.info(formattedArgs[0], ...formattedArgs.splice(1));
};

// module.exports.warn = function(...args) {
//   logger.warn(...formatLogArguments(args));
// };

const error = function (...args: any[]) {
  const formattedArgs = [...formatLogArguments(args, true)];
  logger.error(formattedArgs[0], ...formattedArgs.splice(1));
};

export default { debug, info, error };
