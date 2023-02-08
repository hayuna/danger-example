import { danger, warn } from "danger";

const updateVersion = () => {
  console.log(`started updateVersion`);
  danger.git.JSONDiffForFile("package.json").then((packageDiff) => {
    console.log(packageDiff);
    if (!packageDiff.version) {
      warn("Shouldn't you update package version?");
    }
  });
};

updateVersion();
