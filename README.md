# repo-launch-kit

Turn any repository into a cleaner, more launch-ready open-source project.

`repo-launch-kit` is a zero-dependency Node.js CLI that audits a repository, scores its launch readiness, and can generate the files many projects forget: GitHub Actions, issue templates, PR template, contributing guide, security policy, changelog, and a public scorecard.

## Why People Star This Kind of Tool

- It solves a boring but common problem.
- It works on existing projects.
- It has no service account, no database, and no setup ceremony.
- It creates useful files instead of only printing advice.
- It gives maintainers a shareable scorecard.

## Install

```bash
npm install -g repo-launch-kit
```

Or run from the repository:

```bash
node bin/repo-launch-kit.js audit .
```

## Commands

Audit a project:

```bash
repo-launch-kit audit .
```

Write a machine-readable report:

```bash
repo-launch-kit audit . --json report.json
```

Generate missing launch files:

```bash
repo-launch-kit fix .
```

Run audit and write `REPO_SCORECARD.md`:

```bash
repo-launch-kit scorecard .
```

## What It Checks

- README quality
- license presence
- package scripts
- tests
- CI workflow
- GitHub templates
- contributing guide
- security policy
- changelog
- `.gitignore`
- dependency metadata
- repository hygiene

## Example Output

```text
Repo Launch Kit
Score: 78/100

PASS README exists
PASS License exists
WARN No security policy
FAIL No CI workflow
```

## Generated Files

`repo-launch-kit fix .` can create:

- `.github/workflows/ci.yml`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `.gitignore`

Existing files are never overwritten unless `--force` is passed.

## Philosophy

Most open-source launch advice is scattered across blog posts. This tool turns that advice into an executable checklist and a set of practical defaults.

