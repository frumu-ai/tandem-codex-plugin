---
title: /preview-workflow
description: Preview a Tandem workflow plan or imported bundle without applying. Surfaces the engine's view of the DAG, schedule, and policies.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/preview-workflow <plan_id | path-to-bundle.json>
```

If neither is supplied, ask the user once for one.

## What this command does

- If the argument looks like a `plan_id` (Tandem-issued id, no slashes,
  no `.json`):
  - Calls `client.workflowPlans.preview({ plan_id })` and prints the
    engine's preview verbatim.
- If the argument is a path to a JSON bundle:
  - Reads the file (must be readable from the current workspace).
  - Calls `client.workflowPlans.importPreview({ bundle })` and prints
    the engine's preview.

## Behaviour rules

- Never modify the plan or bundle. Preview is read-only.
- Print the preview's full DAG, schedule, approval gates, and any
  validation errors.
- Recommend `/validate-workflow` next if there are validation errors.
- Recommend `/run-workflow <id>` only when the user has explicitly
  applied and is ready to trigger.

## Output

A short structured response:

- **Trigger / schedule**
- **Agents** (one line each)
- **Nodes** (one line each, with approval gates flagged)
- **Validation errors** (if any, verbatim)
- **Suggested next:** `/validate-workflow <plan_id>`,
  `/create-workflow` (if user wants to start over), or
  apply via `/create-workflow` continuation.
