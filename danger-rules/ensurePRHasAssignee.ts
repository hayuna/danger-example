import { danger, fail } from "danger";

const ensurePRHasAssignee = () => {
  if (danger.github.pr.assignee === null) {
    fail(
      `Please assign someone to merge this PR, and optionally include people who should review`
    );
  }
};

ensurePRHasAssignee();
