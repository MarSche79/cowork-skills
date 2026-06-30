---
name: "msx"
description: "Query and manage your MSX CRM pipeline — opportunities, milestones, tasks, accounts, territories, deal teams. Uses the MSX MCP server (32 tools). Use for \"my pipeline\", \"show my opportunities\", \"milestones for [customer]\", \"territory overview\", \"MSX hygiene check\", \"deal team for [opp]\", \"create task\", \"update milestone\"."
---

Read the skill instructions from C:\Users\<username>\.copilot\skills\msx\SKILL.md before executing.

Quick reference for the wrapper CLI:
- List tools: `node C:\Users\<username>\.copilot\skills\msx\msx-client.js list-tools`
- Call a tool: `node C:\Users\<username>\.copilot\skills\msx\msx-client.js call <toolName> '<argsJSON>'`

Common first actions:
- "Show my pipeline" → call `get_my_active_opportunities` with `{}`
- "Milestones for X" → call `get_milestones` with `{"customerKeyword":"X","format":"triage","includeTasks":true}`
- "Territory overview" → call `get_territory_overview` with appropriate territory filters
- "Who am I in MSX?" → call `crm_whoami` with `{}`

IMPORTANT:
- Always read SKILL.md first for the full tool reference and parameter schemas
- Never call write tools without explicit user confirmation
- The server takes ~10-15s to start on first invocation
- Azure CLI must be authenticated (az login) and VPN must be connected


