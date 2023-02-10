import fs from "fs";
import glob from "fast-glob";
import { Parser as XMLParser } from "xml2js";

/**
 * Get the path to the coverage report.
 */
const getReportPath = () => {
  const [filePath] = glob.sync(`${process.cwd()}/*/clover.xml`);

  return filePath;
};

/**
 * Parse the coverage report.
 */
const parse = async (filePath) => {
  const xmlParser = new XMLParser();

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const data = fs.readFileSync(filePath);
  const { coverage: coverageXml } = await xmlParser.parseStringPromise(data);

  return coverageXml;
};

/**
 * Get the coverage report.
 */
export const getCoverageReport = async (customReportPath) => {
  const filePath = customReportPath || getReportPath();
  const response = await parse(filePath);
  return response;
};
