import * as fs from "fs";
import { Parser as XMLParser } from "xml2js";

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
  const filePath = customReportPath || "./coverage/clover.xml";
  const response = await parse(filePath);
  return response;
};
