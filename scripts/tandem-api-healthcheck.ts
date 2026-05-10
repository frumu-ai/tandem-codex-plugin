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
import { readFileSync } from "node:fs";
import { TandemClient } from "@frumu/tandem-client";

function resolveBaseUrl(): string {
  return process.env.TANDEM_BASE_URL || "http://127.0.0.1:39731";
}

function resolveToken(): { token: string; source: string } {
  if (process.env.TANDEM_UNSAFE_NO_API_TOKEN === "1") {
    return { token: "", source: "TANDEM_UNSAFE_NO_API_TOKEN=1" };
  }
  const direct = process.env.TANDEM_API_TOKEN;
  if (direct) return { token: direct, source: "TANDEM_API_TOKEN" };

  const filePath = process.env.TANDEM_API_TOKEN_FILE;
  if (filePath) {
    try {
      const tok = readFileSync(filePath, "utf8").trim();
      if (tok) return { token: tok, source: `TANDEM_API_TOKEN_FILE (${filePath})` };
      console.error(`[tandem-codex-plugin] TANDEM_API_TOKEN_FILE is empty: ${filePath}`);
      process.exit(2);
    } catch (err) {
      console.error(`[tandem-codex-plugin] Failed to read TANDEM_API_TOKEN_FILE (${filePath}):`);
      console.error(err);
      process.exit(2);
    }
  }

  console.error(`[tandem-codex-plugin] No engine token found.`);
  console.error(`Set TANDEM_API_TOKEN or TANDEM_API_TOKEN_FILE.`);
  console.error(`See shared/tandem-auth.md or run /tandem-setup in Codex.`);
  process.exit(2);
}

async function main() {
  const baseUrl = resolveBaseUrl();
  const { token, source } = resolveToken();

  if (source === "TANDEM_UNSAFE_NO_API_TOKEN=1") {
    console.warn(
      "[tandem-codex-plugin] WARNING: TANDEM_UNSAFE_NO_API_TOKEN=1 — " +
        "engine token enforcement is disabled. Do not use on shared engines.",
    );
  }

  const client = new TandemClient({ baseUrl, token });
  try {
    const health = await client.health();
    console.log(
      JSON.stringify({ ok: true, baseUrl, tokenSource: source, health }, null, 2),
    );
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] Healthcheck failed:");
    console.error(`  baseUrl=${baseUrl}`);
    console.error(`  tokenSource=${source}`);
    console.error(err);
    process.exit(1);
  }
}

main();
