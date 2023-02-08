import { danger, warn } from "danger";

const updateVersion = () => {
  console.log(`started updateVersion`);
  danger.git.JSONDiffForFile("package.json").then((packageDiff) => {
    console.log({
      before: packageDiff.version.before,
      after: packageDiff.version.after,
      compare: packageDiff.version.before === packageDiff.version.after,
    });
    if (
      packageDiff.version &&
      packageDiff.version.before === packageDiff.version.after
    ) {
      warn("Shouldn't you update package version?");
    }
  });
};

updateVersion();
