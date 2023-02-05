import { danger, warn } from "danger";
import { NoConsoleOptions } from "../types";

const PATTERN = /console\.(log|error|warn|info)/;
const GLOBAL_PATTERN = new RegExp(PATTERN.source, "g");
const JS_FILE = /\.(js|ts)x?$/i;

const findConsole = (content: string, whitelist: string[]): any[] => {
  let matches = content.match(GLOBAL_PATTERN);
  if (!matches) return [];

  const consoles = matches.filter((match) => {
    const singleMatch = PATTERN.exec(match);
    if (!singleMatch || singleMatch.length === 0) return false;
    return !whitelist.includes(singleMatch[1]);
  });

  return consoles;
};

const isFileInDangerRules = (file: string): boolean => {
  return file.includes("danger-rules/");
};

const defaultCallback = (file: string, matches: number) => {
  warn(`${matches} console statement(s) added in ${file}.`);
};

const noConsole = async ({
  whitelist = [],
  callback = defaultCallback,
}: NoConsoleOptions = {}) => {
  const diffs = [...danger.git.created_files, ...danger.git.modified_files]
    .filter((file) => JS_FILE.test(file))
    .map((file) => {
      return danger.git.diffForFile(file).then((diff) => ({ file, diff }));
    });

  const additions = await Promise.all(diffs);

  additions
    .filter(({ diff }) => !!diff)
    .forEach(({ file, diff }) => {
      if (!isFileInDangerRules(file)) {
        if (diff) {
          const matches = findConsole(diff.added, whitelist);
          if (matches.length === 0) return;
          callback(file, matches.length);
        }
      }
    });
};

noConsole();
