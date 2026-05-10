---
title: /revise-workflow
description: Iterate on an existing Tandem planner draft by sending a follow-up message to the planner chat for a given plan_id.
---

You are operating under the **tandem-workflow-plan-mode** skill. Run the
plan-mode loop for the **Revise existing** route.

## Usage

```
/revise-workflow <plan_id>
```

If `plan_id` is missing, ask the user for it once. Don't guess.

## What this command does

1. Reads the user's revision request (in their message or via a follow-up
   prompt).
2. Calls
   `client.workflowPlans.chatMessage({ plan_id, message: <revision> })`.
3. Prints the engine's updated draft summary.
4. Repeats until the user is satisfied (or escalates with
   `/preview-workflow` / `/validate-workflow`).

## Behaviour rules

- One revision message per turn. Don't bundle multiple revisions into one
  `chatMessage` unless the user explicitly asked.
- Surface engine errors verbatim.
- Do not apply or run from this command.
- If the user's revision adds an external write, repeat the approval-gate
  audit: list every external write currently in the draft and confirm it
  is gated.

## Output

Short, structured response:

- **Revision applied:** one-line summary of the change.
- **Updated plan summary:** brief DAG snapshot (agents, schedule,
  approval gates).
- **Next:** suggested follow-up command.
