import { danger, warn } from "danger";

const requireChangelog = ({ changelogFile }: { changelogFile: string }) => {
  console.log(`started requireChangelog`);
  const hasChangelog = danger.git.modified_files.includes(changelogFile);

  if (!hasChangelog) {
    warn(
      "Please add a changelog entry for your changes. You can find it in `" +
        changelogFile
    );
  }
};

requireChangelog({
  changelogFile: "CHANGELOG.md",
});
