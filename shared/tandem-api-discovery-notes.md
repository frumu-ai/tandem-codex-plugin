# Tandem API Discovery Notes

This file is the plugin's source-of-truth log for what we know about
Tandem's HTTP API and SDK, plus a clearly marked list of fields and
behaviours we have **not** verified.

Last refresh: based on `docs.tandem.ac` (stable channel) via the Tandem
Docs MCP; not against the `frumu-ai/tandem` source repository (no
access in this environment).

---

## Verified endpoints

### Health

- `GET /global/health` — returns `{ ok: true, ... }` when the engine is up.

### Workflow plans (intent → DAG)

- `POST /workflow-plans/preview`
- `POST /workflow-plans/chat/start`
- `POST /workflow-plans/chat/message`
- `POST /workflow-plans/apply`
- `POST /workflow-plans/import-preview`
- `POST /workflow-plans/import`

SDK methods (`@frumu/tandem-client`):
`client.workflowPlans.{chatStart, chatMessage, apply, importPreview, importPlan, preview}`.

### V2 automations (manual / complex DAG)

- `POST /automations/v2`
- `POST /automations/v2/{id}/run_now`
- `GET  /automations/v2/{id}/runs`
- `GET  /automations/v2/runs/{run_id}`
- `POST /automations/v2/{id}/pause`, `/resume`, `/repair` (per docs)

SDK methods:
`client.automationsV2.{create, runNow, listRuns, getRun, pauseRun, resumeRun, repair}`.

### Mission builder (multi-stage)

- `POST /mission-builder/compile-preview`
- `POST /mission-builder/apply`

### MCP

- `POST /mcp` — add a server.
- `POST /mcp/{name}/connect`
- `POST /mcp/{name}/refresh`
- `PATCH /mcp/{name}` — update allowlist, etc.
- `GET  /mcp/tools` — list discovered tools.
- `GET  /tool/ids` — list all tool ids (built-in + MCP).

### Auth

- Header forms (any one): `X-Agent-Token: <tok>`, `X-Tandem-Token: <tok>`,
  `Authorization: Bearer <tok>`.
- Env vars: `TANDEM_API_TOKEN`, `TANDEM_API_TOKEN_FILE`,
  `TANDEM_CONTROL_PANEL_ENGINE_TOKEN`.
- Dev escape hatch: `TANDEM_UNSAFE_NO_API_TOKEN=1` (warns on every
  request; not for shared/hosted engines).

---

## Verified per-agent V2 fields

```json
{
  "agent_id": "research",
  "display_name": "Research",
  "model_policy": {
    "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
  },
  "tool_policy": {
    "allowlist": ["read", "websearch"],
    "denylist": []
  },
  "mcp_policy": {
    "allowed_servers": ["composio"],
    "allowed_tools": ["mcp.composio.github_issues_list"]
  },
  "approval_policy": "auto",
  "skills": []
}
```

## Verified automation-level fields

- `name`, `status: "active" | "paused"`
- `schedule` (V2 shape — see below)
- `agents[]`
- `flow.nodes[]` with `node_id`, `agent_id`, `objective`, `prompt`,
  `output_contract`, `depends_on[]`
- `workspace_root`
- `creator_id`
- `handoff_config.auto_approve: false`
- `metadata.triage_gate: true`
- `external_integrations_allowed: false | true`
- `requires_approval` (legacy routine field)
- Capability flags: `creates_agents`, `modifies_grants` (require
  approval).

## Verified schedule shapes

V2 / workflow plans:
```json
{
  "type": "interval",
  "interval_seconds": 86400,
  "timezone": "UTC",
  "misfire_policy": { "type": "run_once" }
}
```
or
```json
{
  "type": "cron",
  "cron_expression": "0 8 * * *",
  "timezone": "UTC",
  "misfire_policy": { "type": "run_once" }
}
```

Routines (legacy): `{ "type": "interval", "intervalMs": 3600000 }` or a
cron string `"0 8 * * *"`.

---

## Open questions (TODO — verify in source)

These fields are referenced by the user's original spec or by docs in
ways we have not verified end-to-end. The plugin avoids fabricating
them; instead, the design defers to engine validation or asks the user.

### 1. Execution-profile enum (Strict / Guided / YOLO)

- **Status:** *Not* found in the public stable docs as a named enum.
- **Plan:** the plugin substitutes the verified policy primitives —
  `approval_policy`, `requires_approval`, `tool_policy`, `mcp_policy`,
  `scope_policy`, `handoff_config.auto_approve`,
  `external_integrations_allowed`, capability flags — to express the
  same gradient.
- **Verify:** `crates/tandem-server/src/automation_v2/types.rs` and
  `crates/tandem-plan-compiler/src/api.rs` in the `frumu-ai/tandem`
  repo. Look for `ExecutionProfile`, `RunMode`, `Strictness`, or
  similar.

### 2. Output-contract named enum

- **Status:** *Not* documented as a named enum in stable docs.
- **Plan:** `tandem-output-contracts.md` presents five **patterns** for
  the per-stage prompt's `REQUIRED OUTPUT` block, not engine-level
  enum values.
- **Verify:** plan-compiler source for an `OutputContract` or
  `ContractKind` enum.

### 3. Full set of `approval_policy` values

- **Verified value:** `"auto"`.
- **Suspected:** other values exist (e.g. `"required"`, `"gated"`).
- **Plan:** when the user wants a non-`auto` policy, leave the field
  unset and rely on the engine's default approval flow + per-node
  `requires_approval` behaviour, then verify the exact enum in source.

### 4. `mcpServers` field shape inside `plugin.json`

- **Suspected:** can be either a path (`"./.mcp.json"`) or an inline
  object. The Codex docs page on `/codex/plugins/build` returns 403 to
  WebFetch in this environment.
- **Plan:** ship without the `mcpServers` field; the empty `.mcp.json`
  at the plugin root is auto-detected per the public docs index.
- **Verify:** developers.openai.com/codex/plugins/build (when
  accessible) and `openai/plugins` reference plugins on GitHub.

### 5. Mission-builder detailed schema

- **Verified:** endpoints exist (`compile-preview`, `apply`).
- **Not verified:** the full request body shape for multi-stage
  mission compilation.
- **Plan:** route mission requests through `workflowPlans.chatStart`
  unless the user specifically asks for the mission-builder path.

### 6. Repair API specifics

- **Verified:** `client.automationsV2.repair` exists.
- **Not verified:** repair input schema and what the engine reports
  back.
- **Plan:** route imported-bundle issues through `importPreview` first
  and only call repair on the user's explicit request.

---

## Files to read for verification

When you do have access to the `frumu-ai/tandem` source:

- `crates/tandem-server/src/automation_v2/types.rs`
- `crates/tandem-server/src/http/automations_v2.rs`
- `crates/tandem-server/src/http/workflow_planner_parts/`
- `crates/tandem-plan-compiler/src/api.rs`
- `crates/tandem-plan-compiler/src/output_contract.rs` (if it exists)
- `packages/tandem-client-ts/src/`
- `packages/tandem-client-py/src/tandem_client/`

## Citations

- Auth: <https://docs.tandem.ac/engine-authentication-for-agents/>
- Scheduling: <https://docs.tandem.ac/sdk/scheduling-automations/>
- MCP automated agents:
  <https://docs.tandem.ac/mcp-automated-agents/>
- TypeScript SDK: <https://docs.tandem.ac/sdk/typescript/>
- Python SDK: <https://docs.tandem.ac/sdk/python/>
