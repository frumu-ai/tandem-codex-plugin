---
title: /validate-workflow
description: Run the Tandem engine's validator against a plan or imported bundle and surface every error, warning, and policy gap verbatim.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/validate-workflow <plan_id | path-to-bundle.json>
```

## What this command does

- Calls the engine's preview endpoint (same as `/preview-workflow`).
- Additionally inspects the response for:
  - Schema validation errors.
  - Missing/unconnected MCP servers (cross-checks with `client.mcp.list`).
  - Approval-gate gaps (any external write without an approval gate).
  - Schedule sanity (e.g. `interval_seconds < 60`).
  - Missing `output_contract` on any node.
- Reports a structured pass/fail summary.

## Behaviour rules

- **Do not edit** the plan from this command. Validation is read-only.
- Surface engine errors verbatim. Do not paraphrase.
- For every error, propose a concrete fix the user can apply via
  `/revise-workflow`.
- If MCP servers are referenced but not connected, list them and remind
  the user to connect via `POST /mcp` or the Tandem desktop control panel.

## Output

A structured response:

```
Validation summary:
- schema: PASS / FAIL (n errors)
- approval gates: PASS / FAIL (n missing)
- mcp connectivity: PASS / FAIL (n unconnected)
- schedule: PASS / FAIL
- output contracts: PASS / FAIL (n missing)

Engine errors (verbatim):
<...>

Suggested fixes:
1. ...
2. ...

Next: /revise-workflow <plan_id>  (after fixing)
      /preview-workflow <plan_id> (after revision)
```
