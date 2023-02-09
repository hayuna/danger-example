import { danger, warn } from "danger";

export const ensurePRHasAssignee = () => {
  console.log(`started ensurePRHasAssignee`);
  if (danger.github.pr.assignee === null) {
    warn(
      `Please assign someone to merge this PR, and optionally include people who should review`
    );
  }
};

// ensurePRHasAssignee();
