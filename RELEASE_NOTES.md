# Release Notes

This is the canonical release-notes file used by release tooling.

## v0.1.1

This patch release prepares the Tandem Codex Plugin for tagged public
releases and adds a scanner gate for plugin quality.

What's changed:

- Added a GitHub Actions build check that runs `npm run build`.
- Added a release workflow that validates `vX.Y.Z` tags against
  `.codex-plugin/plugin.json`, compiles release notes, and publishes the
  GitHub Release body from those notes.
- Added `CHANGELOG.md`, `RELEASE_NOTES.md`, and
  `docs/RELEASE_PROCESS.md` so future releases have one clear checklist.
- Added the HOL AI Plugin Scanner workflow and release gate with minimum
  score/severity thresholds.
- Updated README badges now that the repository is public.
- Corrected provider setup guidance to use `tandem-engine` provider
  commands, engine config, and provider-specific environment variables.
- Updated license metadata to Frumu LTD.

## v0.1.0

Initial public release of the Tandem Codex Plugin.

This release turns Codex into a Tandem Workflow Architect: a planning
partner for designing Tandem workflows, checking engine readiness, and
handing plans to the Tandem engine for validation, preview, apply, and
run.

Highlights:

- Plan-mode skill for Tandem workflow design.
- Command templates for creating, revising, validating, applying, and
  running workflows.
- Bundled Tandem Docs MCP server at `https://tandem.ac/mcp`.
- Helper scripts for Tandem engine health, workflow draft creation,
  preview, revision, apply, and import.
- Provider/model readiness guidance grounded in `tandem-engine`.
- Public README, examples, license, CI, and release workflows.
