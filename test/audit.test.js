import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { auditRepository } from "../src/audit.js";
import { applyFixes } from "../src/fix.js";

test("audits a sparse repository with a low score", async () => {
  const root = await mkdtemp(join(tmpdir(), "repo-launch-kit-"));
  try {
    await writeFile(join(root, "README.md"), "tiny", "utf8");
    const report = await auditRepository(root);
    assert.equal(report.score < 40, true);
    assert.equal(report.results.some((item) => item.id === "ci" && item.status === "fail"), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fix creates launch files without overwriting existing files", async () => {
  const root = await mkdtemp(join(tmpdir(), "repo-launch-kit-"));
  try {
    await writeFile(join(root, ".gitignore"), "custom\n", "utf8");
    const result = await applyFixes(root);
    assert.equal(result.created.includes(".github/workflows/ci.yml"), true);
    assert.equal(result.skipped.includes(".gitignore"), true);
    assert.equal(await readFile(join(root, ".gitignore"), "utf8"), "custom\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fix improves score", async () => {
  const root = await mkdtemp(join(tmpdir(), "repo-launch-kit-"));
  try {
    await writeFile(join(root, "README.md"), "# Project\n\n".repeat(80), "utf8");
    await writeFile(join(root, "LICENSE"), "MIT", "utf8");
    await writeFile(join(root, "package.json"), JSON.stringify({
      description: "Example",
      license: "MIT",
      keywords: ["repo", "launch", "github"],
      scripts: { test: "node --test" }
    }), "utf8");
    const before = await auditRepository(root);
    await applyFixes(root);
    const after = await auditRepository(root);
    assert.equal(after.score > before.score, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

