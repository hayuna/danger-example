import { danger, warn, fail, message } from "danger";

const PATTERN = /console\.(log|error|warn|info)/;
const JS_FILE = /\.(js|ts)x?$/i;

type ConsoleType = "log" | "error" | "warn" | "info";
type LogLevel = "fail" | "warn" | "message";

interface ConsoleResult {
  type: string;
  lineNumber: number;
  file: string;
}

interface NoConsoleOptions {
  whitelist?: string[];
  logLevel?: LogLevel;
  failMessage?: string;
}

const findConsole = (file: string, content: string, whitelist: string[]) => {
  const lines = content.split("\n");

  const response: ConsoleResult[] = [];
  lines.forEach((line, lineNumber) => {
    let matches = line.match(PATTERN);
    if (matches) {
      if (!whitelist.includes(matches[1])) {
        response.push({ type: matches[0], lineNumber: lineNumber + 1, file });
      }
    }
  });

  return response;
};

const isFileInDangerRules = (file: string): boolean => {
  return file.includes("danger-rules/");
};

export const noConsole = async ({
  whitelist = [],
  logLevel = "warn",
  failMessage = "%file:%lineNumber - %consoleType found",
}: NoConsoleOptions = {}) => {
  (async () => {
    console.log(`started noConsole`);
    const callback = (matches: ConsoleResult) => {
      const fullMessage = failMessage
        .replace("%file", matches.file)
        .replace("%lineNumber", `${matches.lineNumber}`)
        .replace("%consoleType", matches.type);

      switch (logLevel) {
        case "fail":
          fail(fullMessage);
          break;
        case "warn":
          warn(fullMessage);
          break;
        case "message":
          message(fullMessage);
          break;
        default:
          message(fullMessage);
          break;
      }
    };
    const diffs = [...danger.git.created_files, ...danger.git.modified_files]
      .filter((file) => JS_FILE.test(file))
      .map(async (file) => {
        const diff = await danger.git.diffForFile(file);
        return { file, diff };
      });

    const additions = await Promise.all(diffs);

    additions
      .filter(({ diff }) => !!diff)
      .forEach(({ file, diff }) => {
        if (!isFileInDangerRules(file)) {
          console.log(file);
          if (diff) {
            const matches = findConsole(file, diff.added, whitelist);
            if (matches.length === 0) return;
            matches.forEach(callback);
          }
        }
      });
  })();
};

noConsole({
  logLevel: "warn",
  failMessage: `%consoleType found in %file:%lineNumber`,
});
