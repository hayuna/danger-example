import { danger, warn } from ".";

interface RequireChangelog {
  readonly changelogFile: string;
}

export const requireChangelog = ({ changelogFile }: RequireChangelog) => {
  const hasChangelog = danger.git.modified_files.includes(changelogFile);

  if (!hasChangelog) {
    warn(
      "Please add a changelog entry for your changes. You can find it in `" +
        changelogFile
    );
  }
};
