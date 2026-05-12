# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-05-12

### Added

- Expanded the examples library with a new catalog at
  `examples/README.md`.
- Added MCP-driven automation examples for common Tandem use cases:
  support ticket triage, meeting prep briefs, invoice intake, churn-risk
  monitoring, security advisory triage, market research to Notion, and
  prospect email drafting with Gmail approval gates.
- Added examples that demonstrate recurring triage gates, narrow
  per-agent `mcp_policy` allowlists, durable workspace artifacts, and
  explicit approval before external writes.

### Changed

- README now links the expanded examples catalog and highlights the new
  MCP workflow patterns.

## [0.1.1] - 2026-05-11

### Added

- GitHub Actions build check for TypeScript helper scripts.
- Release workflow that validates plugin/package versions, compiles
  release notes from `docs/WHATS_NEW_*`, `RELEASE_NOTES.md`, or
  `CHANGELOG.md`, and creates GitHub Releases from tags.
- AI plugin scanner workflow and release gate using
  `hashgraph-online/ai-plugin-scanner-action`.
- Dedicated release-process checklist in `docs/RELEASE_PROCESS.md`.

### Changed

- README header now uses public, matching Shields badges for CI and the
  plugin scanner.
- Provider setup docs now point to `tandem-engine` provider commands,
  engine config, and provider-specific env vars instead of Tandem TUI or
  control-panel provider setup.
- Plugin starter prompts now use natural-language prompts instead of
  slash-command defaults for broader Codex compatibility.
- Release/license metadata now consistently uses Frumu LTD.

## [0.1.0] - 2026-05-11

### Added

- Initial Tandem Workflow Architect plugin for Codex.
- Bundled Tandem Docs MCP configuration.
- Workflow planning skill, command templates, examples, and helper scripts.
- Engine auth, provider readiness, and release workflow documentation.
