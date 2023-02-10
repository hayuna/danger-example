import { danger, markdown, warn } from "../";
import * as path from "path";

import { getCoverageReport } from "./report";

const newLine = "\n";

/**
 * Get flatened file details.
 */
const getFlatFiles = (coverage) => {
  console.log(coverage);
  const parentKey = ["project", "package"].find((key) => key in coverage);

  if (parentKey) {
    return [].concat(...coverage[parentKey].map((item) => getFlatFiles(item)));
  }

  return coverage.file || [];
};

/**
 * Get the percentage covered for a given metric.
 */
const getCoveredPercentage = (covered, total) => {
  const percentage = (covered / total) * 100;

  if (!Number(total)) {
    return 100;
  }

  if (Number.isNaN(percentage)) {
    return "-";
  }

  return Number(percentage.toFixed(2));
};

/**
 * Get the percentages for all metrics.
 */
const getMetricPercentages = ({
  statements,
  coveredstatements,
  conditionals,
  coveredconditionals,
  methods,
  coveredmethods,
  lines,
  coveredlines,
}) => ({
  statements: getCoveredPercentage(coveredstatements, statements),
  branches: getCoveredPercentage(coveredconditionals, conditionals),
  functions: getCoveredPercentage(coveredmethods, methods),
  lines: getCoveredPercentage(coveredlines, lines),
});

/**
 * Get the metrics for a file.
 */
const getFileMetrics = (file) => {
  const { line: lines = [], metrics } = file;
  const fileMetrics = metrics?.[0].$ || {};

  const uncoveredLines = lines.filter((line) => !Number(line.$?.count || 0));

  return {
    ...fileMetrics,
    lines: lines.length,
    coveredlines: lines.length - uncoveredLines.length,
    uncoveredLines,
  };
};

/**
 * Shorten a path so that it fits in a GitHub comment.
 */
const getShortPath = (filePath, maxChars) => {
  const parts = filePath
    .split("/")
    .reverse()
    .filter((x) => x);

  if (parts.length === 1) {
    return filePath;
  }

  const shortParts: string[] = [];

  let currentChars = 0;

  parts.forEach((part, index) => {
    const isLastPart = parts.length - 1 === index;
    currentChars += part.length + 1; // +1 for the path seperator
    const prefixLength = !isLastPart ? 3 : 0;

    if (currentChars + prefixLength < maxChars) {
      shortParts.push(part);
    }
  });

  if (shortParts.length < parts.length) {
    shortParts.push("..");
  }

  return shortParts.reverse().join("/");
};

/**
 * Insert whitespace into a path so that it wraps within the Markdown table.
 */
const getWrappedPath = (filePath) => {
  const parts = filePath.split("/");
  const maxPerLine = 25;
  let currentChars = 0;

  return parts
    .map((pathPart, i) => {
      const isLastPart = parts.length - 1 === i;
      const newPart = isLastPart ? pathPart : `${pathPart}/`;
      currentChars += pathPart.length;

      if (currentChars + (parts[i + 1]?.length || 0) > maxPerLine) {
        currentChars = 0;
        return `${newPart}<br>`;
      }

      return newPart;
    })
    .join("");
};

/**
 * Check if we have passed the thresholds for the given percentages.
 */
const hasPassed = (threshold, { statements, branches, functions, lines }) =>
  (Number(statements) >= threshold.statements || statements === "-") &&
  (Number(branches) >= threshold.branches || branches === "-") &&
  (Number(functions) >= threshold.functions || functions === "-") &&
  (Number(lines) >= threshold.lines || lines === "-");

/**
 * Build a row for the coverage table.
 */
const buildRow = (
  file,
  { threshold, maxChars, maxUncovered, wrapFilenames }
) => {
  const fileMetrics = getFileMetrics(file);

  const { sha } = danger.git?.commits?.[danger.git.commits.length - 1] || {};

  const longPath = path.relative(process.cwd(), file.$.path);
  const shortPath = getShortPath(longPath, maxChars);
  const readablePath = wrapFilenames ? getWrappedPath(shortPath) : shortPath;

  const fileLink = `../blob/${sha}/${longPath}`;
  const fileCell = sha ? `[${readablePath}](${fileLink})` : readablePath;

  const percentages = getMetricPercentages(fileMetrics);

  const noLines = !fileMetrics.lines;
  let emoji = hasPassed(threshold, percentages) ? ":white_check_mark:" : ":x:";

  if (noLines) {
    emoji = "-";
  }

  let uncoveredCell = fileMetrics.uncoveredLines
    .slice(0, maxUncovered)
    .map((line) => {
      const lineNumber = line.$.num;
      const anchor = `#L${lineNumber}`;

      return sha ? `[${lineNumber}](${fileLink + anchor})` : lineNumber;
    })
    .join(", ");

  if (fileMetrics.uncoveredLines.length > maxUncovered) {
    uncoveredCell += "...";
  }

  return [
    "",
    fileCell,
    noLines ? "-" : percentages.statements,
    noLines ? "-" : percentages.branches,
    noLines ? "-" : percentages.functions,
    noLines ? "-" : percentages.lines,
    uncoveredCell,
    emoji,
    "",
  ].join("|");
};

/**
 * Join items in a table row.
 */
const joinRow = (items) => `|${items.map((item) => item).join("|")}|`;

/**
 * Build the coverage table.
 */
const buildTable = (files, opts) => {
  const { maxRows, showAllFiles } = opts;

  const headings = [
    `${showAllFiles ? "" : "Impacted "}Files`,
    "% Stmts",
    "% Branch",
    "% Funcs",
    "% Lines",
    "Uncovered Lines",
    "",
  ];

  const headingRow = joinRow(headings);
  const seperator = joinRow(
    new Array(headings.length).fill(undefined).reduce(
      (acc, _, index) => [
        ...acc,
        index === 0 ? "---" : ":-:", // Center align all but the first column
      ],
      []
    )
  );

  const allFileRows = files.map((file) => buildRow(file, opts));
  const mainFileRows = allFileRows.slice(0, maxRows);
  const extraFileRows = allFileRows.slice(maxRows);

  let table = [headingRow, seperator, ...mainFileRows].join(newLine);

  if (extraFileRows.length) {
    table += [
      newLine,
      "<details>",
      "<summary>",
      `and ${extraFileRows.length} more...`,
      "</summary>",
      "",
      headingRow,
      seperator,
      ...extraFileRows,
      "</details>",
    ].join(newLine);
  }

  return table;
};

/**
 * Get a line for the threshold summary.
 */
const getThresholdSummaryLine = (percentages, key, threshold) => {
  const wasMet = Number(percentages[key]) >= (threshold[key] || 0);

  if (wasMet) {
    return "";
  }

  return `Coverage threshold for ${key} (${threshold[key]}%) not met: ${percentages[key]}%`;
};

/**
 * Build the test summary.
 */
const buildSummary = (
  metrics,
  { successMessage, failureMessage, threshold }
) => {
  const percentages = getMetricPercentages(metrics);
  const passed = hasPassed(threshold, percentages);

  const thresholdSummary = [
    getThresholdSummaryLine(percentages, "statements", threshold),
    getThresholdSummaryLine(percentages, "branches", threshold),
    getThresholdSummaryLine(percentages, "functions", threshold),
    getThresholdSummaryLine(percentages, "lines", threshold),
  ].filter((x) => !!x); // Remove empty strings

  if (passed) {
    return `> ${successMessage}`;
  }

  return [
    `> ${failureMessage}`,
    ...(thresholdSummary.length ? ["", "```", ...thresholdSummary, "```"] : []),
  ].join(newLine);
};

/**
 * Get the combined metrics for the checked files.
 */
const getCombinedMetrics = (files) =>
  files.reduce((acc, file) => {
    const fileMetrics = getFileMetrics(file);

    Object.keys(fileMetrics).forEach((key) => {
      acc[key] = acc[key] || 0 + Number(fileMetrics[key]);
    });

    return acc;
  }, {});

/**
 * Get the relevant files.
 */
const getRelevantFiles = (coverageXml, { showAllFiles }) => {
  const files = getFlatFiles(coverageXml);
  console.log(files[0]);
  const allFiles = [
    ...(danger.git?.created_files || []),
    ...(danger.git?.modified_files || []),
  ];

  const relevantFiles = files.filter((file) =>
    allFiles.includes(path.relative(process.cwd(), file.$.path))
  );

  if (showAllFiles) {
    return files;
  }

  return relevantFiles;
};

/**
 * Report coverage.
 */
export const coverage = async (initialOpts = {}) => {
  const opts = {
    successMessage: ":+1: Test coverage is looking good.",
    failureMessage:
      "Test coverage is looking a little low for the files created " +
      "or modified in this PR, perhaps we need to improve this.",
    cloverReportPath: null,
    maxRows: 3,
    maxChars: 100,
    maxUncovered: 10,
    wrapFilenames: true,
    showAllFiles: false,
    warnOnNoReport: true,
    threshold: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    ...initialOpts,
  };

  const coverageXml = await getCoverageReport(opts.cloverReportPath);

  if (!coverageXml) {
    if (opts.warnOnNoReport) {
      warn(
        "No coverage report was detected. " +
          "Please output a report in the `clover.xml` format before running danger"
      );
    }
    return;
  }

  const relevantFiles = getRelevantFiles(coverageXml, opts);

  if (!relevantFiles.length) {
    return;
  }

  const combinedMetrics = getCombinedMetrics(relevantFiles);
  const table = buildTable(relevantFiles, opts);
  const summary = buildSummary(combinedMetrics, opts);
  const report = ["## Coverage Report", summary, table].join(newLine + newLine);

  markdown(report);
};
