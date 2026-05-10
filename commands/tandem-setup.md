---
title: /tandem-setup
description: Discover where the local Tandem engine and token are configured. Docs-driven walkthrough — does not assume a specific install path or token location.
---

You are operating under the **tandem-workflow-plan-mode** skill.

## Purpose

Help the user discover (or rediscover) how Tandem is installed on this
machine and where the engine token lives. This command is **docs-driven
guidance**, not a "the token is definitely at <path>" statement.

Use this when:

- A user has just installed the plugin and isn't sure how to point it at
  an engine.
- `/tandem-doctor` reported a missing token or a connection failure.
- The user switched between the headless engine and the control panel
  and isn't sure which token is current.

## Behaviour

### Step 1 — Show the two supported install paths

State both options. Do not pick one for the user unless they ask.

**A. Engine / headless**

```bash
npm install -g @frumu/tandem
tandem-engine serve --hostname 127.0.0.1 --port 39731
```

`@frumu/tandem` provides the `tandem` master CLI and the `tandem-engine`
binary. Best for servers, CI, or anywhere the web UI isn't wanted.

**B. Control panel**

```bash
npm install -g @frumu/tandem       # provides the `tandem` master CLI
tandem install panel               # installs @frumu/tandem-panel
tandem panel init                  # provisions panel + engine + token
```

Best for local dev where the user also wants the web UI.

> **Legacy compatibility.** A standalone `tandem-setup` CLI from
> `@frumu/tandem-panel` is referenced in older docs. Mention it only if
> the user reports they followed older docs.

### Step 2 — Walk token discovery (in this order)

State the resolution order without claiming a specific file path:

1. **`TANDEM_API_TOKEN`** env var. Simplest. Set in shell or `.env`.
2. **`TANDEM_API_TOKEN_FILE`** env var pointing at a file containing the
   token. Path is whatever the installer chose — check the output of
   `tandem panel init` or your engine-bring-up script.
3. **SDK `token` constructor option.** Used by the helper scripts in
   `scripts/` after they load `.env`.

If the user installed via the panel, point them at the panel's
Settings → Engine Auth view to copy or rotate the token.

### Step 3 — List the accepted request headers

For users hand-rolling fetch calls (the SDK handles this automatically):

- `X-Agent-Token: <token>`
- `X-Tandem-Token: <token>`
- `Authorization: Bearer <token>`

### Step 4 — Report what's detectable from the current env

Without echoing values, report:

- `TANDEM_BASE_URL`: value or "(using default `http://127.0.0.1:39731`)"
- `TANDEM_API_TOKEN`: "set" or "unset"
- `TANDEM_API_TOKEN_FILE`: "set: `<path>`" or "unset" (path is fine to
  show; token contents are not)
- `TANDEM_UNSAFE_NO_API_TOKEN`: "set (unsafe)" or "unset"

### Step 5 — Suggest next

End with: "Run `/tandem-doctor` to verify the engine is reachable and
the token works."

## Behaviour rules

- **Do not** claim the token "definitely lives at" any path. Use phrasing
  like "your installer likely wrote it to a path of its choosing — check
  its output".
- **Do not** modify files, env vars, or run setup commands. This is
  read-only guidance.
- **Never** echo the token value, even partially.
- Reference [`shared/tandem-auth.md`](../shared/tandem-auth.md) for the
  full recipe.

## Output

A short structured response with these sections, in order:

1. Detected env (without secrets).
2. Install paths (A and B).
3. Token discovery order.
4. Accepted headers.
5. Suggested next command.
