---
title: /apply-workflow
description: Apply a Tandem workflow-plan draft created via /create-workflow or /revise-workflow. Calls workflowPlans.apply, then importPreview on the returned bundle. Stops short of import (gated behind explicit approval).
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/apply-workflow <plan_id> [creator_id]
```

If `plan_id` is missing, ask the user once. `creator_id` defaults to
`codex-plugin` when not supplied.

## What this command does

1. Calls `client.workflowPlans.apply({ planId, creatorId })`.
2. If `applied.plan_package_bundle` is returned, calls
   `client.workflowPlans.importPreview({ bundle: applied.plan_package_bundle })`
   and prints the engine's compatibility report.
3. **Stops there.** Final import (`workflowPlans.importPlan`) creates a
   live plan in the user's Tandem and is gated behind explicit
   approval — see `/import-preview-workflow`.

The helper is `scripts/tandem-apply-workflow.ts`
(`npm run apply -- <plan_id> [creator_id]`).

## Behaviour rules

- Surface the engine's response verbatim for both phases
  (`apply` and `importPreview`).
- If `importPreview.import_validation.compatible !== true`, do **not**
  recommend import; recommend `/revise-workflow <plan_id>` instead.
- Never call `importPlan` from this command.
- Never call `runNow` on whatever the apply returns; that is
  `/run-workflow`'s job.
- If the engine returns `401` / `403`, surface verbatim and route the
  user to `/tandem-doctor`.

## Output

```
Apply summary:
- plan_id: <id>
- creator_id: <id>
- engine response: <one-line summary; full JSON above>

Import preview:
- compatible: <true | false>
- conflicts: <count or list, verbatim>

Next:
- compatible=true:  /import-preview-workflow ./<bundle-path>  (final import; explicit approval)
- compatible=false: /revise-workflow <plan_id>                (fix conflicts and re-apply)
```
