#!/usr/bin/env tsx
/**
 * Healthcheck for the local Tandem engine.
 *
 * Reads TANDEM_BASE_URL and the engine token (TANDEM_API_TOKEN or
 * TANDEM_API_TOKEN_FILE) via scripts/lib/tandem-config.ts, calls
 * client.health() (which hits GET /global/health), and exits 0 on
 * success.
 *
 * Usage:
 *   npm run healthcheck
 *
 * Raw-fetch alternative kept as a comment for transparency:
 *
 *   const res = await fetch(`${baseUrl}/global/health`, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *   const body = await res.json();
 *   process.exit(body.ok ? 0 : 1);
 */

import "dotenv/config";
import { createClient, describeTokenSource } from "./lib/tandem-config.ts";

async function main() {
  const { client, baseUrl, tokenSource } = createClient();
  const sourceLabel = describeTokenSource(tokenSource);

  try {
    const health = await client.health();
    console.log(
      JSON.stringify({ ok: true, baseUrl, tokenSource: sourceLabel, health }, null, 2),
    );
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] Healthcheck failed:");
    console.error(`  baseUrl=${baseUrl}`);
    console.error(`  tokenSource=${sourceLabel}`);
    console.error(err);
    process.exit(1);
  }
}

main();
