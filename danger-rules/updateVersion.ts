import { danger, warn } from "danger";

const updateVersion = () => {
  danger.git.JSONDiffForFile("package.json").then((packageDiff) => {
    if (!packageDiff.version) {
      warn("Shouldn't you update package version?");
    }
  });
};

updateVersion();
