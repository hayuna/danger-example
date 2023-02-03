import { danger, warn, fail } from "danger";


const reviewLargePR = () => {
  const bigPRThreshold = 300;
  if (
    danger.github.pr.additions + danger.github.pr.deletions >
    bigPRThreshold
  ) {
    warn(
      `:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, easier review.`
    );
  }
};

const ensurePRHasAssignee = () => {
  if (danger.github.pr.assignee === null) {
    fail(
      `Please assign someone to merge this PR, and optionally include people who should review`
    );
  }
};

reviewLargePR();
ensurePRHasAssignee();
