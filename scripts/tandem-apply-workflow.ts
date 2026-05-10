#!/usr/bin/env tsx
/**
 * Apply a Tandem workflow plan and run an importPreview on the
 * returned bundle.
 *
 * Calls `client.workflowPlans.apply({ planId, creatorId })`. If the
 * apply response contains `plan_package_bundle`, follows up with
 * `client.workflowPlans.importPreview({ bundle })` so the user can see
 * the engine's compatibility report.
 *
 * Stops there. Final import (which actually creates the live plan) is
 * gated behind explicit user approval and lives in a separate script:
 * `npm run import-plan -- ./bundle.json` (or `/import-preview-workflow`
 * in Codex).
 *
 * Usage:
 *   npm run apply -- <plan_id> [creator_id]
 *
 * Defaults `creator_id` to "codex-plugin" when not supplied.
 */

import "dotenv/config";
import { createClient } from "./lib/tandem-config.ts";

async function main() {
  const args = process.argv.slice(2);
  const planId = args[0]?.trim();
  const creatorId = (args[1]?.trim() || "codex-plugin");

  if (!planId) {
    console.error("Usage: npm run apply -- <plan_id> [creator_id]");
    process.exit(64);
  }

  const { client } = createClient();

  try {
    const applied = await client.workflowPlans.apply({ planId, creatorId });
    console.log(JSON.stringify({ phase: "apply", applied }, null, 2));

    const bundle = (applied as { plan_package_bundle?: unknown }).plan_package_bundle;
    if (!bundle) {
      console.error(
        "[tandem-codex-plugin] apply did not return a plan_package_bundle. " +
          "Skipping importPreview.",
      );
      process.exit(0);
    }

    const importPreview = await client.workflowPlans.importPreview({ bundle });
    console.log(JSON.stringify({ phase: "importPreview", importPreview }, null, 2));

    const validation = (importPreview as { import_validation?: { compatible?: boolean } })
      .import_validation;
    if (validation?.compatible) {
      console.error(
        "\nimportPreview reports compatible. Final import is gated behind\n" +
          "explicit user approval. To finalize, write the bundle to a file and run:\n" +
          "  npm run import-plan -- ./bundle.json\n" +
          "or use /import-preview-workflow in Codex.",
      );
    } else {
      console.error(
        "\nimportPreview reports incompatible. Do NOT import.\n" +
          `Run /revise-workflow ${planId} to fix and re-apply.`,
      );
    }
    process.exit(0);
  } catch (err) {
    console.error("[tandem-codex-plugin] apply failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
