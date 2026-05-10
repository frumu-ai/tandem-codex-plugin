#!/usr/bin/env tsx
/**
 * Healthcheck for the local Tandem engine.
 *
 * Reads TANDEM_BASE_URL and TANDEM_API_TOKEN from .env (or process env),
 * calls the SDK's health endpoint, and exits 0 on success.
 *
 * Usage:
 *   npm run healthcheck
 *
 * Raw-fetch alternative (kept here as a comment so anyone can verify the
 * SDK is just wrapping a plain HTTP call):
 *
 *   const res = await fetch(`${baseUrl}/global/health`, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *   const body = await res.json();
 *   process.exit(body.ok ? 0 : 1);
 */

import "dotenv/config";
import { TandemClient } from "@frumu/tandem-client";

function envOrDie(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    console.error(`[tandem-codex-plugin] Missing env: ${name}`);
    console.error(`See shared/tandem-auth.md for token sources.`);
    process.exit(2);
  }
  return v;
}

async function main() {
  const baseUrl = envOrDie("TANDEM_BASE_URL", "http://127.0.0.1:39731");
  const tokenless = process.env.TANDEM_UNSAFE_NO_API_TOKEN === "1";
  const token = tokenless ? "" : envOrDie("TANDEM_API_TOKEN");

  if (tokenless) {
    console.warn(
      "[tandem-codex-plugin] WARNING: TANDEM_UNSAFE_NO_API_TOKEN=1 — " +
        "engine token enforcement is disabled. Do not use on shared engines.",
    );
  }

  const client = new TandemClient({ baseUrl, token });
  try {
    const health = await client.health();
    console.log(JSON.stringify({ ok: true, baseUrl, health }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] Healthcheck failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
