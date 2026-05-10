# Tandem Codex Plugin

**Plan with Codex. Govern with Tandem. Run with receipts.**

A Codex CLI plugin that turns Codex into a *Tandem Workflow Architect*: a
plan-mode design partner that helps you shape Tandem workflows (V2
automations and workflow plans) and hands them to the Tandem engine for
validation, preview, and run.

> Codex helps you think. Tandem runs and governs. This plugin glues the two
> together without replacing either.

---

## 1. What this is

A focused Codex plugin (skill + slash commands + shared design rules + worked
examples) that:

- Walks you through designing a Tandem workflow from intent
  (`/create-workflow`) or by hand-assembling a complex multi-agent DAG
  (`/build-complex-workflow`).
- Calls the **real Tandem HTTP API** to draft, preview, validate, and apply
  workflows — so the engine is always the source of truth.
- Bakes in Tandem's actual policy primitives: `tool_policy`, `mcp_policy`,
  `approval_policy`, `scope_policy`, `model_policy`, `output_contract`,
  schedules, and triage gates.
- Refuses to apply or run anything destructive, externally visible, public,
  paid, or irreversible without explicit user approval.

## 2. Who it's for

- **Tandem operators** who use Codex daily and want a structured way to
  design new workflows without leaving the CLI.
- **Workflow authors** who already know Tandem and want a faster scaffolding
  loop than a blank editor.
- **Teams** who want Codex's design help while keeping all execution and
  governance inside Tandem.

This plugin does **not** target users who have never used Tandem. It assumes
a running Tandem engine and an engine token.

## 3. How it helps Tandem users

- Accelerates the **first 80%** of authoring: trigger, agents, per-stage
  prompts, output contracts, approval gates, MCP allowlists.
- Forces good defaults: every external write is approval-gated, every stage
  has an explicit `output_contract`, every agent has a tool allowlist.
- Treats source-only fields as engine-validated, not Codex-fabricated. When
  Codex doesn't know an exact field name, it asks the engine instead of
  guessing.
- Surfaces engine errors verbatim, then helps you fix them.

## 4. Install in Codex

### From a local checkout (development)

```bash
git clone https://github.com/frumu-ai/tandem-codex-plugin.git
cd tandem-codex-plugin
codex marketplace add "$(pwd)"
```

In the Codex TUI:

```
/plugins
```

Find **Tandem Workflow Architect** and install it. The new slash commands
appear in `/help` once installed.

### From GitHub (when the repo is public)

```bash
codex marketplace add https://github.com/frumu-ai/tandem-codex-plugin.git
```

Codex caches the plugin under `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`.

## 5. Configure Tandem API access

The plugin talks to a running Tandem engine over HTTP. Two pieces of config:

| Variable | What | Default |
|---|---|---|
| `TANDEM_BASE_URL` | Where the engine listens | `http://127.0.0.1:39731` |
| `TANDEM_API_TOKEN` | Engine token (see §6) | — |

Copy `.env.example` to `.env` and fill in `TANDEM_API_TOKEN`. The helper
scripts in `scripts/` read this `.env`. The skill itself instructs Codex to
read these same env vars from your shell.

Detailed auth recipe: [`shared/tandem-auth.md`](./shared/tandem-auth.md).

## 6. Provide the engine token

Three verified ways to give the plugin a token (any one works):

1. **Env var.** `export TANDEM_API_TOKEN=<token>`. The plugin and scripts
   pick this up.
2. **Token file.** `export TANDEM_API_TOKEN_FILE=/path/to/token`. The Tandem
   SDK reads the file. Useful with the OS keychain.
3. **Generate locally.** `tandem-engine token generate` prints a token; pipe
   it into `TANDEM_API_TOKEN` or a file. The control panel and SDKs share
   this token via the keychain by default.

> The engine accepts the token as `X-Agent-Token`, `X-Tandem-Token`, or
> `Authorization: Bearer …`. The bundled SDK handles the header for you.

A dev-only escape hatch (`TANDEM_UNSAFE_NO_API_TOKEN=1`) is supported but
**not recommended**. The engine logs a warning on every request when this
is set. Do not use it on hosted, public, or shared engines.

## 7. The plan-mode loop

This is what the plugin's skill walks you through every time:

1. **Understand intent.** What are you actually trying to automate? What's
   the trigger, the inputs, and the desired artifact?
2. **Classify.** Is this a single-agent routine, a multi-agent V2 DAG, a
   planner-generated workflow, or a revision/repair of an existing one?
3. **Draft Tandem-shaped JSON.** Per-stage objective, prompt,
   `output_contract`, `tool_policy`, `mcp_policy`, `approval_policy`,
   `model_policy`, `scope_policy`, schedule, triage gate.
4. **Explain the graph in plain language.** No JSON dump until the user
   sees the picture.
5. **Ask only blocking questions.** Don't ask for things Tandem can answer
   later (defaults, MCP discovery, model fallback).
6. **Validate via the API.** Use `client.workflowPlans.preview` or
   `client.automationsV2.create` (status `paused`) to surface errors.
7. **Apply only with explicit approval.** Never auto-apply. Never auto-run.

Full design rules: [`shared/tandem-workflow-design-rules.md`](./shared/tandem-workflow-design-rules.md).

## 8. Build from intent

```
/create-workflow
```

Describe the goal in plain language. The skill calls
`client.workflowPlans.chatStart`, returns a `plan_id`, and shows the draft
DAG. Iterate with:

```
/revise-workflow <plan_id>
```

When ready:

```
/preview-workflow <plan_id>
/validate-workflow <plan_id>
```

Then, after explicit approval, the skill calls `client.workflowPlans.apply`.

Worked example: [`examples/reddit-research-to-notion.md`](./examples/reddit-research-to-notion.md).

## 9. Build a complex manual workflow

```
/build-complex-workflow
```

The skill walks you through each agent (id, display name, model, tool
allowlist, MCP allowlist), each node in the DAG (`agent_id`, `objective`,
`prompt`, `output_contract`, `depends_on`, `approval_policy`), and the
schedule. It assembles a V2 automation JSON and calls
`client.automationsV2.create` with `status: "paused"` so you can inspect
before arming.

Worked example: [`examples/manual-complex-workflow.md`](./examples/manual-complex-workflow.md).

## 10. How MCP fits in

Tandem already knows how to manage MCP servers. The plugin's job is to:

- Help you decide **which** MCP tools each agent needs.
- Generate explicit `mcp_policy.allowed_servers` and
  `mcp_policy.allowed_tools` for each agent.
- Call out when an MCP isn't connected yet (`mcp_list`, `mcp_list_catalog`)
  and refuse to fabricate a tool name.

The plugin's `.mcp.json` is intentionally empty. Configure MCP servers in
your Tandem engine (control panel or `POST /mcp`), not in this plugin. Each
example workflow documents which MCP servers it expects.

## 11. What this plugin does NOT do

- It does **not** replace Tandem's planner, validator, or runtime.
- It does **not** store, cache, or transmit your engine token. Tokens stay
  in your shell env or token file.
- It does **not** run workflows in Codex. Every `run` is a Tandem API call.
- It does **not** auto-apply or auto-run anything destructive, externally
  visible, public, paid, or irreversible. Approval is mandatory for any
  write outside the workspace.
- It does **not** invent Tandem field names. When a field is uncertain, the
  skill asks the engine or asks you, never both.

## 12. Layout note

Two paths in this repo are required by the **Codex plugin specification**
(see [developers.openai.com/codex/plugins/build](https://developers.openai.com/codex/plugins/build)):

| Path | Why |
|---|---|
| `.codex-plugin/plugin.json` | Codex's required manifest location. |
| `.agents/plugins/marketplace.json` | Repo-scoped Codex marketplace entry. |

Everything else (`skills/`, `commands/`, `shared/`, `examples/`, `scripts/`,
`.mcp.json`, `assets/`) is at the repo root, which is the conventional
plugin layout.

---

## Layout at a glance

```
.codex-plugin/plugin.json        Codex manifest
.agents/plugins/marketplace.json Repo-scoped marketplace entry
.mcp.json                        Plugin-bundled MCP config (empty by default)
skills/tandem-workflow-plan-mode/SKILL.md
commands/{create,revise,build-complex,preview,validate,run}-workflow.md
shared/tandem-workflow-design-rules.md
shared/tandem-api-discovery-notes.md
shared/tandem-output-contracts.md
shared/tandem-approval-gates.md
shared/tandem-auth.md
examples/{reddit-research-to-notion,github-bug-monitor,manual-complex-workflow,repo-task-runner}.md
scripts/tandem-api-healthcheck.ts
scripts/tandem-create-workflow-draft.ts
scripts/tandem-preview-workflow.ts
```

## References

- Codex plugin spec: <https://developers.openai.com/codex/plugins/build>
- Codex skills: <https://developers.openai.com/codex/skills>
- Codex MCP: <https://developers.openai.com/codex/mcp>
- Tandem auth: <https://docs.tandem.ac/engine-authentication-for-agents/>
- Tandem TypeScript SDK: <https://docs.tandem.ac/sdk/typescript/>
- Tandem scheduling: <https://docs.tandem.ac/sdk/scheduling-automations/>
- Tandem MCP automated agents: <https://docs.tandem.ac/mcp-automated-agents/>

## License

MIT.
