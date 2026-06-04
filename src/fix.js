import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const templates = {
  ".github/workflows/ci.yml": `name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test --if-present
      - run: npm run build --if-present
`,
  ".github/pull_request_template.md": `## Summary

## Changes

## Testing

## Checklist

- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Risk is understood
`,
  ".github/ISSUE_TEMPLATE/bug_report.yml": `name: Bug report
description: Report a reproducible problem
title: "[Bug]: "
labels: ["bug"]
body:
  - type: textarea
    id: summary
    attributes:
      label: Summary
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
    validations:
      required: true
`,
  ".github/ISSUE_TEMPLATE/feature_request.yml": `name: Feature request
description: Suggest an improvement
title: "[Feature]: "
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposal
    validations:
      required: true
`,
  "CONTRIBUTING.md": `# Contributing

Thanks for improving this project.

## Local Setup

1. Fork the repository.
2. Install dependencies.
3. Run tests before opening a pull request.

## Pull Requests

- Keep changes focused.
- Include tests for behavior changes.
- Update documentation when user-facing behavior changes.
`,
  "SECURITY.md": `# Security Policy

Please do not open public issues for security reports.

Send a private report to the maintainer with:

- affected version
- reproduction steps
- expected impact
- suggested fix if available
`,
  "CHANGELOG.md": `# Changelog

## 1.0.0

- Initial release.
`,
  ".gitignore": `node_modules/
dist/
coverage/
*.log
.DS_Store
`
};

export async function applyFixes(root, options = {}) {
  const created = [];
  const skipped = [];

  for (const [path, content] of Object.entries(templates)) {
    const destination = join(root, path);
    if (!options.force && await exists(destination)) {
      skipped.push(path);
      continue;
    }

    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content, "utf8");
    created.push(path);
  }

  return { created, skipped };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

