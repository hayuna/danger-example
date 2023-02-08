import { danger, warn } from "danger";

const requireChangelog = ({ changelogFile }: { changelogFile: string }) => {
  const hasChangelog = danger.git.modified_files.includes(changelogFile);

  if (!hasChangelog) {
    warn(
      "Please add a changelog entry for your changes. You can find it in `" +
        changelogFile +
        "` \n\nPlease add your change and name to the main section."
    );
  }
};

requireChangelog({
  changelogFile: "CHANGELOG.md",
});
