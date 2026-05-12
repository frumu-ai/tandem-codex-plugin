# Example — Prospect Research → Gmail Drafts → Approval → Send

A V2 automation that researches prospective contacts in a target field,
analyzes what is being marketed to them, drafts compliant outreach, stores
approved candidates as Gmail drafts, and sends only after a final explicit
approval.

> Requires MCP servers: `prospecting` (or an Apollo/Clearbit/CRM/company
> directory equivalent) and `gmail`. Optional: `notion` or `crm` for
> recording campaign status. Tool ids in this example are placeholders;
> discover the exact ids with Tandem MCP tooling before applying.

---

## Intent

> Find public business emails for people in `<target_field>`, analyze
> what competitors market to them, draft a personalized email for each
> prospect, store the drafts in Gmail, ask me for approval, and only
> send emails I approve.

## Generated V2 automation payload

```json
{
  "name": "prospect-email-drafts-gmail-approval",
  "status": "paused",
  "creator_id": "codex-plugin",
  "schedule": { "type": "manual" },
  "external_integrations_allowed": true,
  "handoff_config": { "auto_approve": false },
  "agents": [
    {
      "agent_id": "prospector",
      "display_name": "Prospect Researcher",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "websearch", "webfetch"] },
      "mcp_policy": {
        "allowed_servers": ["prospecting"],
        "allowed_tools": [
          "mcp.prospecting.search_people",
          "mcp.prospecting.get_company",
          "mcp.prospecting.verify_email"
        ]
      },
      "approval_policy": "auto"
    },
    {
      "agent_id": "strategist",
      "display_name": "Campaign Strategist",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "anthropic/claude-3.5-sonnet" }
      },
      "tool_policy": { "allowlist": ["read", "write", "websearch", "webfetch"] },
      "mcp_policy": { "allowed_servers": [], "allowed_tools": [] },
      "approval_policy": "auto"
    },
    {
      "agent_id": "gmail-operator",
      "display_name": "Gmail Operator",
      "model_policy": {
        "default_model": { "provider_id": "openrouter", "model_id": "openai/gpt-4o-mini" }
      },
      "tool_policy": { "allowlist": ["read", "write"] },
      "mcp_policy": {
        "allowed_servers": ["gmail"],
        "allowed_tools": [
          "mcp.gmail.drafts_create",
          "mcp.gmail.drafts_send"
        ]
      }
    }
  ],
  "flow": {
    "nodes": [
      {
        "node_id": "find-prospects",
        "agent_id": "prospector",
        "objective": "Find verified public business contacts in the requested target field.",
        "prompt": "ROLE: Prospect researcher.\n\nINPUTS:\n- target_field: {{ run.input.target_field }}\n- region: {{ run.input.region | default(\"United States\") }}\n- max_prospects: {{ run.input.max_prospects | default(10) }}\n- ideal_customer_profile: {{ run.input.ideal_customer_profile }}\n\nTASK:\n1. Use websearch/webfetch and mcp.prospecting.search_people to find prospects matching the target field and ICP.\n2. Use mcp.prospecting.get_company for company context.\n3. Use mcp.prospecting.verify_email only for public business addresses or contacts from approved lead sources.\n4. Exclude personal emails, sensitive categories, role accounts with no named contact, and contacts without a source URL.\n\nCONSTRAINTS:\n- Read-only. Do not send, draft, subscribe, enrich beyond approved sources, or write to external systems.\n- Respect opt-out/suppression input if provided.\n- Do not infer private personal data.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: {\n    \"prospects\": [\n      { \"name\", \"title\", \"company\", \"business_email\", \"source_url\", \"why_relevant\", \"confidence\" }\n    ]\n  }\n- schema_version: \"1\"\n- success_criteria:\n    - prospects.length <= max_prospects\n    - every prospect has source_url and confidence\n    - no personal email domains unless explicitly approved by policy",
        "output_contract": "structured_json"
      },
      {
        "node_id": "analyze-positioning",
        "agent_id": "strategist",
        "depends_on": ["find-prospects"],
        "objective": "Analyze what is currently marketed to the selected audience.",
        "prompt": "ROLE: Campaign strategist.\n\nINPUTS:\n- target_field: {{ run.input.target_field }}\n- offer: {{ run.input.offer }}\n- upstream:structured_json.payload.prospects[]\n\nTASK:\n1. Use websearch/webfetch to inspect competitor landing pages, ads archives when available, review sites, and public messaging aimed at this target field.\n2. Summarize common promises, objections, differentiators, and compliance risks.\n3. Save a brief to file://reports/prospect-positioning-<target-field-slug>-<YYYY-MM-DD>.md.\n\nCONSTRAINTS:\n- Do not make unverifiable claims.\n- Keep the analysis focused on public marketing messages and buyer pain points.\n\nREQUIRED OUTPUT (output_contract: research_brief):\n- findings[]: { source_url, title, summary, relevance_score }\n- top_themes[]: string\n- objections[]: string\n- differentiation_angles[]: string\n- has_work: boolean\n- success_criteria:\n    - findings[] cite public URLs\n    - differentiation_angles[] maps to the provided offer\n    - has_work is true iff prospects[] is non-empty",
        "output_contract": "research_brief"
      },
      {
        "node_id": "draft-emails",
        "agent_id": "strategist",
        "depends_on": ["find-prospects", "analyze-positioning"],
        "objective": "Draft personalized outreach emails as workspace artifacts.",
        "prompt": "ROLE: Outreach writer.\n\nINPUTS:\n- offer: {{ run.input.offer }}\n- sender: {{ run.input.sender }}\n- upstream:structured_json.payload.prospects[]\n- upstream-2:research_brief.top_themes[]\n- upstream-2:research_brief.objections[]\n- upstream-2:research_brief.differentiation_angles[]\n\nTASK:\n1. Draft one email per prospect with a concise subject and body.\n2. Personalize using only sourced company/contact context.\n3. Include a plain-text opt-out line.\n4. Save the draft set to file://reports/email-drafts-<target-field-slug>-<YYYY-MM-DD>.json.\n\nCONSTRAINTS:\n- Do not call Gmail tools in this stage.\n- No deceptive urgency, fake familiarity, or unsupported performance claims.\n- Keep each email under 150 words.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: {\n    \"drafts\": [\n      { \"prospect_email\", \"prospect_name\", \"company\", \"subject\", \"body\", \"source_url\", \"risk_notes\" }\n    ],\n    \"draft_file\": string\n  }\n- schema_version: \"1\"\n- success_criteria:\n    - drafts.length equals prospects.length\n    - every body includes an opt-out line\n    - draft_file exists and is non-empty",
        "output_contract": "structured_json"
      },
      {
        "node_id": "create-gmail-drafts",
        "agent_id": "gmail-operator",
        "depends_on": ["draft-emails"],
        "objective": "Create Gmail drafts for reviewer-approved outreach candidates.",
        "prompt": "ROLE: Gmail draft operator.\n\nINPUTS:\n- upstream:structured_json.payload.drafts[]\n\nTASK:\n1. For each approved draft candidate, call mcp.gmail.drafts_create with To, Subject, and Body.\n2. Skip drafts the reviewer rejects.\n3. Record the Gmail draft id for each created draft.\n\nCONSTRAINTS:\n- This stage requires human approval before any mcp.gmail.drafts_create call.\n- Creating a Gmail draft is an external write; do not auto-approve it.\n- Do not send mail in this stage.\n\nREQUIRED OUTPUT (output_contract: structured_json):\n- payload: { \"gmail_drafts\": [ { \"prospect_email\", \"draft_id\", \"subject\" } ] }\n- schema_version: \"1\"\n- success_criteria:\n    - every draft_id is non-empty\n    - gmail_drafts.length <= upstream drafts.length",
        "output_contract": "structured_json"
      },
      {
        "node_id": "send-approved-emails",
        "agent_id": "gmail-operator",
        "depends_on": ["create-gmail-drafts"],
        "objective": "Send only the Gmail drafts that receive final approval.",
        "prompt": "ROLE: Gmail sender.\n\nINPUTS:\n- upstream:structured_json.payload.gmail_drafts[]\n\nTASK:\n1. Present the Gmail draft ids and recipients for final approval.\n2. For each approved draft, call mcp.gmail.drafts_send.\n3. Skip any draft not explicitly approved.\n\nCONSTRAINTS:\n- This stage requires final human approval before any send action.\n- Never send to a suppressed, unsubscribed, or rejected recipient.\n- Stop on the first Gmail API error and report the failed draft id.\n\nREQUIRED OUTPUT (output_contract: artifact):\n- artifact_kind: \"mcp_call_result\"\n- location: list of sent Gmail message ids\n- artifact_summary: \"Sent N approved outreach emails\"\n- success_criteria:\n    - location contains only message ids returned by Gmail\n    - N is less than or equal to approved draft count",
        "output_contract": "artifact"
      }
    ]
  }
}
```

## Triggering a run

```ts
await client.automationsV2.runNow({
  id: "prospect-email-drafts-gmail-approval",
  input: {
    target_field: "RevOps leaders at B2B SaaS companies",
    region: "United States",
    max_prospects: 10,
    ideal_customer_profile: "Series A-C SaaS teams with complex outbound workflows",
    offer: "A workflow automation audit for improving sales handoffs",
    sender: "Alex from ExampleCo"
  }
});
```

## Approval gates

- `find-prospects`, `analyze-positioning`, and `draft-emails` are
  read/workspace-only and can run automatically.
- `create-gmail-drafts` is gated because Gmail draft creation writes to
  an external account.
- `send-approved-emails` is a second, final approval gate. Approval to
  create a draft is not approval to send it.

## Why this shape

- Prospecting, strategy, drafting, and sending are separate stages so
  each stage has a small tool surface.
- Gmail tools are isolated to one agent and split into two nodes so draft
  creation and sending have distinct approvals.
- The prompts include basic outreach safety constraints: public business
  contact sources, no personal email scraping, opt-out language, and no
  unsupported claims.
