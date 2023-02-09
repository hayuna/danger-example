import { ensurePRHasAssignee } from "./danger-rules/ensurePRHasAssignee";
import { noConsole } from "./danger-rules/noConsole";
import { requireChangelog } from "./danger-rules/requireChangelog";
import { reviewLargePR } from "./danger-rules/reviewLargePR";
import { updateVersion } from "./danger-rules/updateVersion";

ensurePRHasAssignee();

noConsole({
  logLevel: "warn",
  failMessage: `%consoleType found in %file:%lineNumber`,
});

requireChangelog({
  changelogFile: "CHANGELOG.md",
});

reviewLargePR({ linesLimit: 300 });

updateVersion();
