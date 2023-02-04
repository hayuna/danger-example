import * as fs from "fs";

fs.readdirSync("./danger-rules").forEach((file) => {
  console.log(file);
  fs.appendFileSync(
    "./dangerfile.ts",
    fs.readFileSync(`./danger-rules/${file}`).toString()
  );
});
