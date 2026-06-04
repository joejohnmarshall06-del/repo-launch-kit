#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { auditRepository, formatReport, makeScorecard } from "../src/audit.js";
import { applyFixes } from "../src/fix.js";

const args = process.argv.slice(2);
const command = args[0] || "help";
const target = resolve(args[1] || ".");

async function main() {
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "audit") {
    const report = await auditRepository(target);
    const jsonPath = readFlag("--json");
    if (jsonPath) {
      await writeJson(resolve(jsonPath), report);
    }
    console.log(formatReport(report));
    exitForReport(report);
    return;
  }

  if (command === "fix") {
    const force = hasFlag("--force");
    const result = await applyFixes(target, { force });
    for (const item of result.created) {
      console.log(`created ${item}`);
    }
    for (const item of result.skipped) {
      console.log(`skipped ${item}`);
    }
    const report = await auditRepository(target);
    console.log(formatReport(report));
    exitForReport(report);
    return;
  }

  if (command === "scorecard") {
    const report = await auditRepository(target);
    await writeFile(resolve(target, "REPO_SCORECARD.md"), makeScorecard(report), "utf8");
    console.log("created REPO_SCORECARD.md");
    console.log(formatReport(report));
    exitForReport(report);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 2;
}

function printHelp() {
  console.log(`repo-launch-kit

Usage:
  repo-launch-kit audit <path> [--json report.json]
  repo-launch-kit fix <path> [--force]
  repo-launch-kit scorecard <path>
`);
}

function hasFlag(name) {
  return args.includes(name);
}

function readFlag(name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

async function writeJson(path, value) {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function exitForReport(report) {
  if (report.score < 60) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

