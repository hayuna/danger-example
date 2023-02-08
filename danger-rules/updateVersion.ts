import { danger, warn } from "danger";

const updateVersion = () => {
  console.log(`started updateVersion`);
  danger.git.JSONDiffForFile("package.json").then((packageDiff) => {
    if (
      packageDiff.version &&
      packageDiff.version.before === packageDiff.version.after
    ) {
      warn("Shouldn't you update package version?");
    }
  });
};

updateVersion();
