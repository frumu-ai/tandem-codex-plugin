# Tandem Auth Recipe

The plugin talks to a running Tandem engine over HTTP. The engine is
authenticated by a single token. This file covers all verified ways to
provide that token.

Reference: <https://docs.tandem.ac/engine-authentication-for-agents/>.

---

## 1. Get the engine running

```bash
tandem-engine serve --hostname 127.0.0.1 --port 39731
```

The default URL the plugin uses is `http://127.0.0.1:39731`. Override
via `TANDEM_BASE_URL`.

Healthcheck:

```bash
curl http://127.0.0.1:39731/global/health
# → {"ok": true, ...}
```

When using the bundled SDK:

```ts
const client = new TandemClient({ baseUrl, token });
await client.health();
```

---

## 2. Provide the token

Three verified ways. Pick one.

### Option A — env var (simplest)

```bash
export TANDEM_API_TOKEN="$(tandem-engine token generate)"
```

Or copy from the control panel's Settings → Engine Auth panel.

### Option B — token file

```bash
tandem-engine token generate > ~/.tandem/engine.token
chmod 600 ~/.tandem/engine.token
export TANDEM_API_TOKEN_FILE=~/.tandem/engine.token
```

Useful with the OS keychain or sealed-secrets workflows. The Tandem SDK
reads the file lazily, so the token never has to live in process env.

### Option C — control-panel-injected env var

Set `TANDEM_CONTROL_PANEL_ENGINE_TOKEN` if the control panel manages
your engine. The SDK falls back to this when `TANDEM_API_TOKEN` and
`TANDEM_API_TOKEN_FILE` are unset.

---

## 3. Header forms

The engine accepts any of these on a request:

- `X-Agent-Token: <token>`
- `X-Tandem-Token: <token>`
- `Authorization: Bearer <token>`

The bundled SDK picks one automatically. If you're hand-rolling fetch
calls, prefer `Authorization: Bearer`.

```ts
fetch(`${baseUrl}/global/health`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
```

---

## 4. Healthcheck script

```bash
npm run healthcheck
```

Runs `scripts/tandem-api-healthcheck.ts`. It exits 0 with `ok` printed
when auth and connectivity are good.

---

## 5. Common 401 / 403 failures

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | No token sent | Check env var or header. |
| `401` despite token | Token rotated or expired | Regenerate with `tandem-engine token generate`. |
| `403 Forbidden` | Endpoint requires a different scope (e.g. control-panel-only) | Use the control panel or escalate scope. |
| `connection refused` | Engine not running | Start with `tandem-engine serve …`. |
| Engine logs warn `unsafe-no-token` | `TANDEM_UNSAFE_NO_API_TOKEN=1` is set | Unset for any non-trusted-local-dev use. |

---

## 6. Dev-only escape hatch

```bash
export TANDEM_UNSAFE_NO_API_TOKEN=1
```

Bypasses token enforcement on the engine and the SDK. The engine logs a
warning **on every request** when this is set.

**Do not** use on:
- Anything reachable from another machine.
- Hosted, shared, or production engines.
- CI runners.
- Any machine with sensitive workspaces or MCP credentials.

The plugin's helper scripts honour this flag for parity with the engine,
but the README warns against it.

---

## 7. The plugin's contract with you

This plugin **never**:

- Logs your token.
- Writes your token to disk.
- Sends your token to anyone but the configured Tandem engine.
- Persists your token between sessions.

If you see token bytes in any plugin log or commit, treat it as a bug
and rotate the token immediately:

```bash
tandem-engine token generate
```
