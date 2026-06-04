import { access, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const checks = [
  {
    id: "readme",
    label: "README exists and has substance",
    weight: 14,
    run: async (root) => {
      const text = await readText(root, "README.md");
      return Boolean(text && text.trim().length >= 400);
    },
    recommendation: "Add a README with purpose, install, usage, examples, and contribution notes."
  },
  {
    id: "license",
    label: "License exists",
    weight: 10,
    run: (root) => exists(root, "LICENSE"),
    recommendation: "Add a LICENSE file so users understand reuse terms."
  },
  {
    id: "package-scripts",
    label: "Package scripts include test or build",
    weight: 12,
    run: async (root) => {
      const pkg = await readJson(root, "package.json");
      return Boolean(pkg?.scripts?.test || pkg?.scripts?.build);
    },
    recommendation: "Add repeatable scripts such as test, build, lint, or dev."
  },
  {
    id: "tests",
    label: "Test directory or test files exist",
    weight: 10,
    run: async (root) => {
      return exists(root, "test") || exists(root, "tests") || hasAny(root, ["src/index.test.js", "src/index.spec.js"]);
    },
    recommendation: "Add at least one deterministic test for core behavior."
  },
  {
    id: "ci",
    label: "GitHub Actions CI exists",
    weight: 12,
    run: (root) => exists(root, ".github/workflows/ci.yml"),
    recommendation: "Add a CI workflow that runs tests on pull requests."
  },
  {
    id: "contributing",
    label: "Contributing guide exists",
    weight: 8,
    run: (root) => exists(root, "CONTRIBUTING.md"),
    recommendation: "Add CONTRIBUTING.md with setup, branch, and PR guidance."
  },
  {
    id: "security",
    label: "Security policy exists",
    weight: 8,
    run: (root) => exists(root, "SECURITY.md"),
    recommendation: "Add SECURITY.md with responsible disclosure guidance."
  },
  {
    id: "templates",
    label: "Issue and pull request templates exist",
    weight: 10,
    run: async (root) => {
      const issue = await exists(root, ".github/ISSUE_TEMPLATE/bug_report.yml");
      const pr = await exists(root, ".github/pull_request_template.md");
      return issue && pr;
    },
    recommendation: "Add issue templates and a PR template to improve contribution quality."
  },
  {
    id: "changelog",
    label: "Changelog exists",
    weight: 6,
    run: (root) => exists(root, "CHANGELOG.md"),
    recommendation: "Add CHANGELOG.md so users can track releases."
  },
  {
    id: "gitignore",
    label: ".gitignore exists",
    weight: 5,
    run: (root) => exists(root, ".gitignore"),
    recommendation: "Add .gitignore to avoid publishing generated files."
  },
  {
    id: "metadata",
    label: "Package metadata is useful",
    weight: 5,
    run: async (root) => {
      const pkg = await readJson(root, "package.json");
      return Boolean(pkg?.description && pkg?.license && Array.isArray(pkg?.keywords) && pkg.keywords.length >= 3);
    },
    recommendation: "Add description, license, and keywords to package metadata."
  }
];

export async function auditRepository(root) {
  const results = [];
  let earned = 0;
  let possible = 0;

  for (const check of checks) {
    possible += check.weight;
    const passed = await check.run(root);
    if (passed) {
      earned += check.weight;
    }
    results.push({
      id: check.id,
      label: check.label,
      status: passed ? "pass" : "fail",
      weight: check.weight,
      recommendation: passed ? null : check.recommendation
    });
  }

  return {
    root,
    score: Math.round((earned / possible) * 100),
    earned,
    possible,
    results
  };
}

export function formatReport(report) {
  const lines = [
    "Repo Launch Kit",
    `Score: ${report.score}/100`,
    ""
  ];

  for (const result of report.results) {
    const marker = result.status === "pass" ? "PASS" : "FAIL";
    lines.push(`${marker} ${result.label}`);
    if (result.recommendation) {
      lines.push(`     ${result.recommendation}`);
    }
  }

  return lines.join("\n");
}

export function makeScorecard(report) {
  const rows = report.results.map((result) => {
    const status = result.status === "pass" ? "PASS" : "FAIL";
    return `| ${result.label} | ${status} | ${result.weight} | ${result.recommendation || ""} |`;
  });

  return `# Repository Launch Scorecard

Score: **${report.score}/100**

| Check | Status | Weight | Recommendation |
| --- | --- | ---: | --- |
${rows.join("\n")}
`;
}

async function exists(root, path) {
  try {
    await access(join(root, path));
    return true;
  } catch {
    return false;
  }
}

async function hasAny(root, paths) {
  for (const path of paths) {
    if (await exists(root, path)) {
      return true;
    }
  }
  return false;
}

async function readText(root, path) {
  try {
    const file = join(root, path);
    const info = await stat(file);
    if (!info.isFile()) {
      return null;
    }
    return readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function readJson(root, path) {
  try {
    return JSON.parse(await readFile(join(root, path), "utf8"));
  } catch {
    return null;
  }
}

