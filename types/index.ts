export interface NoConsoleOptions {
  whitelist?: string[];
  callback?: (file: string, matches: number) => void;
}
