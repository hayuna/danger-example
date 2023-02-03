import * as DANGER from "danger";

export const ensurePRHasAssignee = () => {
  if (DANGER.danger.github.pr.assignee === null) {
    DANGER.fail(
      `Please assign someone to merge this PR, and optionally include people who should review`
    );
  }
};
