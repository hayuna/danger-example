import * as DANGER from "danger";
import { ensurePRHasAssignee } from "./rule";

const reviewLargePR = () => {
  const bigPRThreshold = 300;
  if (
    DANGER.danger.github.pr.additions + DANGER.danger.github.pr.deletions >
    bigPRThreshold
  ) {
    DANGER.warn(
      `:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, easier review.`
    );
  }
};

reviewLargePR();
ensurePRHasAssignee();
