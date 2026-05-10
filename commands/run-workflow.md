---
title: /run-workflow
description: Trigger an immediate run of an applied Tandem V2 automation, with explicit approval and a final policy-gate audit before the API call.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Usage

```
/run-workflow <automation_id>
```

If `automation_id` is missing, ask once. Don't guess.

## What this command does

1. Fetches the automation via `client.automationsV2.get({ id })`.
2. Prints a one-screen summary:
   - Trigger / schedule.
   - Agents.
   - Nodes with their approval gates.
   - External integrations.
3. **Requires explicit approval.** Do not proceed without a clear "yes,
   run it" from the user. If the user said "go" or "ok" earlier, ask
   again here — this is the final gate.
4. Calls `client.automationsV2.runNow({ id })`.
5. Returns the run id and points the user at the events endpoint.

## Behaviour rules

- If the automation `status: "paused"`, refuse and recommend the user
  switch to `"active"` first (or apply a one-shot `runNow` if Tandem
  supports that for paused automations — TODO: verify).
- If any node has `requires_approval: true` and the user hasn't
  individually acknowledged each, list them and ask again before running.
- Never call `runNow` on multiple automations in one command.
- If the engine returns a 401/403, point the user at `shared/tandem-auth.md`.
- If the engine returns a policy/scope error, surface it verbatim and
  recommend `/validate-workflow`.

## Output

```
Run started:
  automation_id: <id>
  run_id:        <run_id>
  triggered_at:  <iso8601>

Watch:
  curl -N "$TANDEM_BASE_URL/automations/v2/<id>/events"
  or
  client.automationsV2.listRuns({ id })

Approve / deny pending steps:
  via Tandem control panel "Scheduled Bots"
  or
  client.automationsV2.{approveRun, denyRun}(...)
```
