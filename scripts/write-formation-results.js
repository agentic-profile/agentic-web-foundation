#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Writes CloudFormation stack Outputs to an env file.
 *
 * Usage:
 *   node scripts/write-formation-results.js --stage=staging --out=formation-results.env
 *   node scripts/write-formation-results.js --stage=prod --out=formation-results.env
 *
 * Reads ProjectName from ./cloud.env (same convention as existing npm scripts).
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [k, ...rest] = arg.slice(2).split("=");
    out[k] = rest.length ? rest.join("=") : "true";
  }
  return out;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (!key) continue;
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function toDotenvLine(key, value) {
  // Always quote via JSON for safe shell + dotenv parsing.
  return `${key}=${JSON.stringify(String(value ?? ""))}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const stage = args.stage || process.env.STAGE || "staging";
  const outFile = args.out || "formation-results.env";

  const repoRoot = path.resolve(__dirname, "..");
  loadEnvFile(path.join(repoRoot, "cloud.env"));

  const projectName = process.env.ProjectName;
  if (!projectName) {
    console.error('Missing ProjectName. Set it in "cloud.env" (or env).');
    process.exit(1);
  }

  const stackName = stage === "prod" ? projectName : `${projectName}-staging`;

  let parsed;
  try {
    const stdout = execFileSync(
      "aws",
      [
        "cloudformation",
        "describe-stacks",
        "--stack-name",
        stackName,
        "--output",
        "json",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );
    parsed = JSON.parse(stdout);
  } catch (err) {
    const msg = err && err.stderr ? String(err.stderr) : String(err);
    console.error(`Failed to read stack outputs for "${stackName}".`);
    console.error(msg.trim());
    process.exit(1);
  }

  const outputs = parsed?.Stacks?.[0]?.Outputs ?? [];
  const lines = [
    `# Generated from CloudFormation stack outputs`,
    `# stack=${stackName}`,
    `# stage=${stage}`,
    `# generatedAt=${new Date().toISOString()}`,
    "",
    ...outputs.map((o) => toDotenvLine(o.OutputKey, o.OutputValue)),
    "",
  ];

  const outPath = path.resolve(repoRoot, outFile);
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");

  console.log(`Wrote ${outputs.length} outputs to ${path.relative(repoRoot, outPath)}`);
}

main();
