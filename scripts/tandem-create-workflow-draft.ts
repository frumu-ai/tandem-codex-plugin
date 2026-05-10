#!/usr/bin/env tsx
/**
 * Start a Tandem workflow-plan chat from a goal in plain English.
 *
 * Usage:
 *   npm run create-draft -- "Daily Reddit research to Notion"
 *
 * Prints the resulting plan_id and a draft summary. Iterate with
 * `client.workflowPlans.chatMessage` (use /revise-workflow in Codex).
 *
 * Raw-fetch alternative kept here for transparency:
 *
 *   const res = await fetch(`${baseUrl}/workflow-plans/chat/start`, {
 *     method: "POST",
 *     headers: {
 *       "content-type": "application/json",
 *       Authorization: `Bearer ${token}`,
 *     },
 *     body: JSON.stringify({ prompt, planSource: "chat" })
 *   });
 *   const data = await res.json();
 *   console.log(data.plan?.plan_id, data.plan?.summary);
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
  const goal = process.argv.slice(2).join(" ").trim();
  if (!goal) {
    console.error(
      'Usage: npm run create-draft -- "<one-line workflow goal>"',
    );
    process.exit(64);
  }

  const baseUrl = envOrDie("TANDEM_BASE_URL", "http://127.0.0.1:39731");
  const tokenless = process.env.TANDEM_UNSAFE_NO_API_TOKEN === "1";
  const token = tokenless ? "" : envOrDie("TANDEM_API_TOKEN");

  const client = new TandemClient({ baseUrl, token });

  try {
    const draft = await client.workflowPlans.chatStart({
      prompt: goal,
      planSource: "chat",
    });
    const planId = draft.plan?.plan_id ?? draft.plan_id;
    console.log(JSON.stringify({ plan_id: planId, draft }, null, 2));
    if (!planId) {
      console.error(
        "[tandem-codex-plugin] No plan_id returned. Engine response above.",
      );
      process.exit(1);
    }
    console.error(
      `\nNext: iterate with chatMessage, then run /preview-workflow ${planId}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] chatStart failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
