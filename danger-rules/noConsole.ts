import { danger, warn } from "danger";

const PATTERN = /console\.(log|error|warn|info)/;
const GLOBAL_PATTERN = new RegExp(PATTERN.source, "g");
const JS_FILE = /\.(js|ts)x?$/i;

// interface FindConsoleResponse {
//   file: string;
//   lineNumber: number;
//   whichConsole: string;
// }

const findConsole = (file, content, whitelist) => {
  const lines = content.split("\n");
  console.log(lines);
  const response = [];
  lines.forEach((line, lineNumber) => {
    let matches = line.match(PATTERN);
    if (matches) {
      console.log({ type: matches[0], lineNumber, file });
      // const consoles = matches.filter((match) => {
      //   const singleMatch = PATTERN.exec(match);
      //   if (!singleMatch || singleMatch.length === 0) return false;
      //   match.lineNumber = lineNumber;
      //   return !whitelist.includes(singleMatch[1]);
      // });
      // @ts-ignore
      // response.push(consoles|);
    }
  });

  return response;
};

const isFileInDangerRules = (file) => {
  return file.includes("danger-rules/");
};

const defaultCallback = (file, matches) => {
  warn(`${matches} console statement(s) added in ${file}.`);
};

const noConsole = async ({
  whitelist = [],
  callback = defaultCallback,
} = {}) => {
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
          callback(file, matches.length);
        }
      }
    });
};

noConsole();
