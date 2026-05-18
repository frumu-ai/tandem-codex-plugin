---
title: /build-complex-workflow
description: Hand-build a multi-agent Tandem V2 automation. Walks through agents, DAG nodes, per-stage prompts, output contracts, policies, and schedule; creates the automation in paused state for inspection.
---

You are operating under the **tandem-workflow-plan-mode** skill. Run the
plan-mode loop for the **Manual / complex DAG** route.

## What this command does

1. Walks the user through each agent in the DAG, prompting for the fields
   listed under "Per-agent fields" below.
2. Walks the user through each node in the DAG, prompting for the fields
   listed under "Per-node fields".
3. Assembles a V2 automation payload (see `shared/tandem-workflow-design-rules.md`).
4. Calls `client.automationsV2.create({ ...payload, status: "paused" })`.
5. Echoes the engine response. Surfaces validation errors verbatim.
6. Asks for explicit approval before flipping `status` to `"active"`.

## Per-agent fields (collect once per agent)

- `agent_id` (kebab-case)
- `display_name`
- `model_policy.default_model`: `provider_id`, `model_id`, only when
  Tandem already has a configured default or the user selected a
  confirmed provider/model from `client.providers.config()` /
  `client.providers.catalog()`. Codex authentication is not provider
  authentication.
- `tool_policy.allowlist[]` and (if needed) `denylist[]`
- `mcp_policy.allowed_servers[]` and `mcp_policy.allowed_tools[]`
- For every MCP tool, mirror the exact `mcp.<server>.<tool>` id into
  `tool_policy.allowlist[]`. Do not rely on server attachment alone.
- `approval_policy` — only `"auto"` for read-only agents with no external
  side-effects. Otherwise leave it unset and rely on the engine's default
  approval gates.
- `skills[]` (optional)

## Per-node fields (collect once per node)

- `node_id` (kebab-case)
- `agent_id` (must match an agent above)
- `objective` (one short sentence)
- `metadata.builder.prompt` (full structured prompt — use the skeleton in
  `skills/tandem-workflow-plan-mode/SKILL.md`)
- `tool_policy` and `mcp_policy` for every MCP-using node. Mirror exact
  allowed MCP tool ids into both `tool_policy.allowlist[]` and
  `mcp_policy.allowed_tools[]`. For nodes that should have no MCP access,
  set `mcp_policy.allowed_servers: []`, `mcp_policy.allowed_tools: []`,
  and deny broad MCP patterns such as `mcp.notion.*` or `mcp.hunter.*`
  when those servers are attached elsewhere in the workflow.
- Keep local `write` in `tool_policy.allowlist[]` for output-producing
  V2 nodes. Structured/report nodes usually need to write a run-scoped
  artifact for their `output_contract`; deny external MCP write tools
  separately instead of denying local artifact writes. Denying local
  `write` can block the node at runtime with missing `artifact_write`
  before any final artifact is produced.
- `output_contract` (see `shared/tandem-output-contracts.md` — pick one of
  the five patterns). For connector-only research nodes, set
  `enforcement.validation_profile: "artifact_only"` and require concrete
  connector receipts with `enforcement.required_tool_calls[]`; `mcp_list`
  or tool inventory calls do not count as research.
- `depends_on[]` (parent node ids)

## Automation-level fields

- `name`
- `status: "paused"` on first create
- `schedule` (`{ type, interval_seconds | cron_expression, timezone, misfire_policy }`)
- `workspace_root` (when the workflow touches files)
- `creator_id: "codex-plugin"`
- `metadata.triage_gate: true` for Smart Heartbeat skip on empty cycles
- `handoff_config.auto_approve: false` (default)
- Do not include `external_integrations_allowed` in V2 payloads unless
  the installed engine's `AutomationV2CreateInput` source or validation
  explicitly accepts it. It is verified for legacy routines, while current
  V2 payloads express external-write governance through exact agent
  tool/MCP policies, approval gates, and
  `handoff_config.auto_approve: false`.

## Node instructions

Put the full stage prompt under `metadata.builder.prompt`. Current V2
engine structs do not expose a top-level `prompt` field on `flow.nodes[]`;
top-level unknown fields may be ignored by the server.

## Behaviour rules

- Build the payload **incrementally**, showing the user the current JSON
  after each agent and after each node. Don't dump a massive blob at the
  end.
- Refuse to add a tool to `tool_policy.allowlist` that you cannot name
  exactly. If the user says "github", ask which composio/github MCP tool
  IDs (e.g. `mcp.composio.github_issues_list`).
- When a node must use an MCP connector to do real work, require that
  specific tool in the output contract or builder metadata. Server
  attachment and `mcp_list` only prove availability, not task completion.
- When revising an existing automation, state that patched definitions
  affect only new runs. Existing runs keep their original snapshot and
  should be restarted after policy/contract fixes.
- For every agent that writes externally, add a comment in the per-stage
  prompt that the engine will gate this on approval.
- If the user wants `status: "active"` immediately, ask once: "Are you
  sure? I usually create paused so you can inspect first." If they
  confirm, do it.

## Output

Final response after a successful create:

- **Automation id**
- **Status** (paused/active)
- **Approval gates** (list of nodes that require approval and why)
- **Next:** `/run-workflow <automation_id>` once you've inspected the
  paused automation in Tandem. (The plugin's `/preview-workflow`
  applies to workflow-plan prompts and bundles, not V2 automation
  ids; review the V2 automation in the control panel or via
  `automationsV2.listRuns`.)
