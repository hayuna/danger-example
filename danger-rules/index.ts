import { DangerDSLType } from "danger/distribution/danger";

interface Danger {
  danger: DangerDSLType;
  message(message: string): void;
  warn(message: string): void;
  fail(message: string): void;
  markdown(message: string): void;
}

/**
 * Danger injects their API into global scope and blocks any attempt to import from their module.
 * In order to support correct types of their API, we need to wrap global values and re-export them.
 */
function declareGlobal<T extends keyof Danger>(name: T) {
  const value = global[name as any] as Danger[T];
  if (!value) {
    throw new Error(`danger global "${name}" not found`);
  }
  return value;
}

export const danger = declareGlobal("danger");
export const message = declareGlobal("message");
export const warn = declareGlobal("warn");
export const fail = declareGlobal("fail");
export const markdown = declareGlobal("markdown");
