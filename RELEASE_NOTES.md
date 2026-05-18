# Release Notes

This is the canonical release-notes file used by release tooling.

## v0.1.4

This release tightens the Tandem V2 automation authoring guidance to match
the current engine schema.

What's changed:

- V2 node prompts are now documented under `metadata.builder.prompt`.
- V2 external-write governance now avoids the legacy
  `external_integrations_allowed` field unless an installed engine
  explicitly validates it.
- Approval-gate guidance now emphasizes exact tool/MCP allowlists, node
  gates, and `handoff_config.auto_approve: false` for V2 workflows.
- V2 MCP safety guidance now requires node-level `tool_policy` and
  `mcp_policy` when servers are attached at workflow/run level, so each
  task only receives the exact tools it needs.
- V2 node policy guidance now preserves local artifact `write` for
  structured/report outputs while continuing to deny external MCP write
  tools where they do not belong.
- Connector-only research nodes now get guidance for
  `artifact_only` validation and `required_tool_calls[]`, making
  `mcp_list`/tool inventory receipts insufficient as research evidence.
- Runtime guidance now calls out frozen V2 run snapshots and points
  blocked-run debugging at `checkpoint.lifecycle_history` when the UI or
  top-level run fields do not show the actionable reason.

## v0.1.3

This patch release tightens Tandem workflow guidance for external MCP
side-effects, especially approval-driven flows where a human decision
should permit a later action but not perform that action itself.

What's changed:

- Updated the Tandem workflow planning skill to treat approval gates as
  decision-only nodes followed by concrete execution nodes.
- Added guidance to mirror exact MCP tool ids in `tool_policy.allowlist`
  and `mcp_policy.allowed_tools`, avoiding broad server grants for
  safety-critical stages.
- Expanded shared approval and workflow design rules with the
  prepare/draft -> approval -> execution pattern.
- Updated the Gmail prospect outreach example so draft creation, send
  approval, and sending use separate agents with narrow tool access.
- Added durable output paths for Gmail draft and send stages so external
  side-effect receipts survive for downstream workflow steps.

## v0.1.2

This patch release expands the Tandem Codex Plugin's worked examples so
teams can start from realistic, MCP-driven automation patterns instead
of a blank workflow.

What's changed:

- Added `examples/README.md` as a catalog of reusable Tandem automation
  examples.
- Added support-ticket triage with Zendesk reads, approved internal
  notes, and Slack escalation.
- Added daily meeting prep briefs from calendar, CRM, and email context.
- Added invoice intake that extracts finance inbox attachments and
  creates accounting bill drafts only after approval.
- Added churn-risk monitoring across CRM, support, billing, analytics,
  and approved Slack/CRM follow-up.
- Added security advisory triage that matches advisories to dependencies
  and creates approved GitHub or Linear remediation issues.
- Added market research and Reddit pain-point analysis saved to an
  approved Notion database row.
- Added prospect research and Gmail outreach drafts with separate
  approval gates for draft creation and sending.
- Updated the README to point readers at the expanded example set.

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
