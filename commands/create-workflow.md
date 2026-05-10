---
title: /create-workflow
description: Design a new Tandem workflow from intent. Creates a planner draft, iterates with the user, validates, and applies only on approval.
---

You are operating under the **tandem-workflow-plan-mode** skill. Run the
plan-mode loop for the **Intent → workflow** route.

## What this command does

1. Asks the user for the workflow's goal in plain language (one short
   prompt). If the user already gave the goal in their message, skip the
   ask.
2. Calls `client.workflowPlans.chatStart({ prompt, planSource: "chat" })`
   via the helper script `scripts/tandem-create-workflow-draft.ts`, or
   directly via the SDK if invoked inside a Tandem-enabled session.
3. Prints the returned `plan_id` and the draft DAG summary.
4. Iterates with `client.workflowPlans.chatMessage({ plan_id, message })`
   until the user says they're satisfied.
5. Validates via `client.workflowPlans.preview({ plan_id })`.
6. Applies *only on explicit user approval* via
   `client.workflowPlans.apply({ plan_id, creator_id: "codex-plugin" })`.

## Required inputs

- `TANDEM_BASE_URL` and `TANDEM_API_TOKEN` available in env (see
  `shared/tandem-auth.md`).
- A running Tandem engine reachable at `TANDEM_BASE_URL`.

## Behaviour rules

- Do not call `runNow` from this command. Use `/run-workflow` for that.
- Always set `creator_id: "codex-plugin"` when applying.
- If `chatStart` fails because of auth, surface the engine error verbatim
  and point at `shared/tandem-auth.md`.
- If the user's goal involves any external write (Notion, Slack, email,
  GitHub, etc.), explicitly confirm the approval gate **before** apply.

## Output

Final response in this command should be a numbered checklist:

1. `plan_id` and one-line summary of the draft.
2. Approval gates surfaced from the preview.
3. Suggested next command (`/preview-workflow <plan_id>` or
   `/validate-workflow <plan_id>` or `/run-workflow <automation_id>` after
   apply).

If apply succeeded, include the resulting automation id.
