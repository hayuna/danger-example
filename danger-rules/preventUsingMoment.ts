import { danger, warn } from "danger";
import * as fs from "fs";

const filesOnly = (file: string) =>
  fs.existsSync(file) && fs.lstatSync(file).isFile();
const getCreatedFileNames = (createdFiles: string[]) =>
  createdFiles.filter(filesOnly);

export const preventUsingMoment = () => {
  console.log(`started preventUsingMoment`);
  const newMomentImports = getCreatedFileNames(danger.git.created_files).filter(
    (filename) => {
      const content = fs.readFileSync(filename).toString();
      return (
        content.includes('from "moment"') ||
        content.includes('from "moment-timezone"')
      );
    }
  );
  if (newMomentImports.length > 0) {
    warn(`We are trying to migrate away from moment towards \`luxon\`, but found moment imports in the following new files:
  ${newMomentImports.map((filename) => `- \`${filename}\``).join("\n")}
  See [docs](https://moment.github.io/luxon/api-docs/index.html).
    `);
  }
};

preventUsingMoment();
