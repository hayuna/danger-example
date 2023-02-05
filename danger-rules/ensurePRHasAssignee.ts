import { danger, warn } from "danger";

const ensurePRHasAssignee = () => {
  if (danger.github.pr.assignee === null) {
    warn(
      `Please assign someone to merge this PR, and optionally include people who should review`
    );
  }
};

ensurePRHasAssignee();
