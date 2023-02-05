import { danger, warn, fail } from "danger";

const PATTERN = /console\.(log|error|warn|info)/;
const GLOBAL_PATTERN = new RegExp(PATTERN.source, "g");
const JS_FILE = /\.(js|ts)x?$/i;

const findConsole = (file, content, whitelist) => {
  const lines = content.split("\n");
  console.log(lines);
  const response = [];
  lines.forEach((line, lineNumber) => {
    let matches = line.match(PATTERN);
    if (matches) {
      if (!whitelist.includes(matches[1])) {
        // @ts-ignore
        response.push({ type: matches[0], lineNumber, file });
      }
    }
  });

  return response;
};

const isFileInDangerRules = (file) => {
  return file.includes("danger-rules/");
};

const noConsole = async ({
  whitelist = [],
  logLevel = "warn",
  failMessage = "%file:%lineNumber - %consoleType found",
} = {}) => {
  const callback = (matches) => {
    let fullMessage = "";
    matches.forEach((match) => {
      const message = failMessage
        .replace("%file", match.file)
        .replace("%lineNumber", match.lineNumber)
        .replace("%consoleType", match.type);
      fullMessage += `${message}\n`;
    });

    switch (logLevel) {
      case "warn":
        warn(fullMessage);
        break;
      default:
        fail(fullMessage);
        break;
    }
  };
  const diffs = [...danger.git.created_files, ...danger.git.modified_files]
    .filter((file) => JS_FILE.test(file))
    .map((file) => {
      return danger.git.diffForFile(file).then((diff) => {
        return { file, diff };
      });
    });

  const additions = await Promise.all(diffs);

  additions
    .filter(({ diff }) => !!diff)
    .forEach(({ file, diff }) => {
      if (!isFileInDangerRules(file)) {
        if (diff) {
          const matches = findConsole(file, diff.added, whitelist);
          if (matches.length === 0) return;
          callback(matches);
        }
      }
    });
};

noConsole({
  logLevel: "warn",
  failMessage: `%consoleType found in %file:%lineNumber`,
});
