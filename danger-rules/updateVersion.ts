import { danger, warn } from "danger";

const updateVersion = () => {
  (async () => {
    console.log(`started updateVersion`);
    const packageDiff = await danger.git.JSONDiffForFile("package.json");
    if (!packageDiff.version) {
      warn("Shouldn't you update package version?");
    }
  })();
};

updateVersion();
