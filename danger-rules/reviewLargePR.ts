import { danger, warn } from "danger";

interface ReviewLargePR {
  readonly linesLimit: number;
}

export const reviewLargePR = ({ linesLimit }: ReviewLargePR) => {
  if (danger.github.pr.additions + danger.github.pr.deletions > linesLimit) {
    warn(
      `:exclamation: Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR for faster, easier review.`
    );
  }
};

reviewLargePR({ linesLimit: 300 });
