#!/usr/bin/env tsx
/**
 * Preview a Tandem workflow plan, given a plan_id or a path to an
 * imported bundle JSON file.
 *
 * Usage:
 *   npm run preview -- <plan_id>
 *   npm run preview -- ./bundle.json
 *
 * For a plan_id: calls client.workflowPlans.preview.
 * For a JSON file path: calls client.workflowPlans.importPreview with
 * the file's parsed contents.
 *
 * Raw-fetch alternative for plan_id:
 *
 *   const res = await fetch(`${baseUrl}/workflow-plans/preview`, {
 *     method: "POST",
 *     headers: {
 *       "content-type": "application/json",
 *       Authorization: `Bearer ${token}`,
 *     },
 *     body: JSON.stringify({ plan_id }),
 *   });
 *   const data = await res.json();
 *   console.log(JSON.stringify(data, null, 2));
 */

import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
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

function looksLikePath(arg: string): boolean {
  return (
    arg.endsWith(".json") ||
    arg.startsWith("./") ||
    arg.startsWith("/") ||
    arg.includes("/")
  );
}

async function main() {
  const arg = process.argv[2]?.trim();
  if (!arg) {
    console.error("Usage: npm run preview -- <plan_id | path-to-bundle.json>");
    process.exit(64);
  }

  const baseUrl = envOrDie("TANDEM_BASE_URL", "http://127.0.0.1:39731");
  const tokenless = process.env.TANDEM_UNSAFE_NO_API_TOKEN === "1";
  const token = tokenless ? "" : envOrDie("TANDEM_API_TOKEN");

  const client = new TandemClient({ baseUrl, token });

  try {
    if (looksLikePath(arg)) {
      const path = resolve(arg);
      if (!existsSync(path)) {
        console.error(`[tandem-codex-plugin] File not found: ${path}`);
        process.exit(2);
      }
      const bundle = JSON.parse(readFileSync(path, "utf8"));
      const preview = await client.workflowPlans.importPreview({ bundle });
      console.log(JSON.stringify(preview, null, 2));
    } else {
      const preview = await client.workflowPlans.preview({ planId: arg });
      console.log(JSON.stringify(preview, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] Preview failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
