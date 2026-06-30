---
name: "ms-roadmap"
description: "Query the Microsoft Release Communications MCP server for M365 roadmap items and Azure updates. Use whenever the user asks 'what's new', 'what's on the roadmap', 'what's coming', or about release/preview/GA dates for Microsoft products like Microsoft 365, Defender, Sentinel, Purview, Entra, Teams, SharePoint, Copilot, Azure services, etc. Also handles retirement / end-of-life questions for Azure."
---

When invoked, you query the Microsoft Release Communications MCP server (https://www.microsoft.com/releasecommunications/mcp) over JSON-RPC to answer roadmap questions.

## Helper script

Use the PowerShell helper at `~/.copilot/m-skills/ms-roadmap/query.ps1` to call the server. It wraps a single JSON-RPC `tools/call` and returns the parsed JSON result.

```powershell
pwsh -File "$HOME\.copilot\m-skills\ms-roadmap\query.ps1" -Tool <toolName> -ArgsJson '<json>'
```

Available `<toolName>` values:
- `get_recent_m365_roadmaps`  – list/search/filter M365 roadmap posts
- `get_m365_roadmap_by_id`    – fetch full untruncated M365 post by id
- `get_recent_azure_updates`  – list/search/filter Azure updates
- `get_azure_update_by_id`    – fetch full untruncated Azure update by id

`<json>` is the `arguments` object. Wrap the whole JSON in single quotes in PowerShell and use `''` to escape internal single quotes (OData uses single quotes around string literals).

## Verified product strings (use these — others return empty)

**M365 roadmap** (Product facet):
- `Microsoft Defender for Office 365`
- `Microsoft Entra`
- `Microsoft Intune`
- `Microsoft Purview`
- `Microsoft Copilot (Microsoft 365)`
- `Microsoft Teams`, `SharePoint`, `OneDrive`, `Exchange`, `Outlook`
- `Microsoft 365`, `Microsoft 365 admin center`, `Microsoft 365 app`
- `Microsoft Loop`, `Microsoft Planner`, `Microsoft Stream`, `Microsoft Whiteboard`, `Forms`, `Microsoft Clipchamp`, `Microsoft Viva`
- Office apps: `Excel`, `Word`, `PowerPoint`, `OneNote`, `Access`

⚠️ `Microsoft Defender for Endpoint`, `Microsoft Defender XDR`, `Microsoft Defender for Identity`, `Microsoft Defender for Cloud Apps`, and `Microsoft Sentinel` are **NOT** products on the M365 roadmap. For those, use the `search` parameter on titles, or the Azure feed for Sentinel/Defender for Cloud.

**Azure updates** (Product facet, security-relevant):
- `Microsoft Sentinel`
- `Microsoft Defender for Cloud`
- `Microsoft Copilot for Security`
- `Microsoft Entra ID (formerly Azure AD)`
- `Microsoft Entra Domain Services`
- `GitHub Advanced Security for Azure DevOps`
- `Azure IoT Central` (has security category)

Always discover before guessing: call the relevant `get_recent_*` tool with `{"include_facets": true}` and inspect `facets[].values` (facet names: `Product`, `ProductCategory`, `Tag`, `Platform`, `ReleaseRing`, `CloudInstance`).

## Routing: M365 vs Azure

- **Sentinel, Defender for Cloud, Entra ID, Copilot for Security** → Azure updates feed.
- **Defender for Office 365, Entra, Intune, Purview, Teams, SharePoint, M365 Copilot** → M365 roadmap.
- **Defender for Endpoint / XDR / Identity / Cloud Apps** → no dedicated product. Use `search` on M365 roadmap titles (e.g. `"search":"Defender for Endpoint"`), and also try the Azure feed.
- Broad asks like "what's new for Security?" → query both feeds in parallel and merge.

## Filter cheatsheet (OData)

M365:
- Product: `products/any(p: p eq 'Microsoft Purview')`
- Status: `status eq 'Launched'` | `'Rolling out'` | `'In development'`
- Availability month: `availabilities/any(a: a/ring eq 'General Availability' and a/month eq 'March' and a/year eq 2026)`
- Combo: `products/any(p: p eq 'Microsoft Intune') and status eq 'Rolling out'`

Azure:
- Product: `products/any(p: p eq 'Microsoft Sentinel')`
- Category: `productCategories/any(pc: pc eq 'Security')`
- Status: `status eq 'Launched'` | `'In preview'` | `'In development'`
- Retirements in a month: `tags/any(t: t eq 'Retirements') and availabilities/any(a: a/ring eq 'Retirement' and a/month eq 'February' and a/year eq 2026)`

Free-text title search via `search` (not `filter`): e.g. `{"search":"passkey"}`.

Pagination: `skip` in increments of 50. Response includes `totalCount`, `hasMore`.

## Workflow

1. Decide M365, Azure, or both based on the products implicated.
2. If unsure of the exact product string, call once with `include_facets:true` first.
3. Build the smallest precise filter; default page size is 50, take the most recent.
4. Sort items most-recent-first by the date you filtered on (GA date → `generalAvailabilityDate`; preview → `previewAvailabilityDate`; published → `created`/`modified`).
5. Present as a markdown table or grouped bullet list with: **Title**, **Status**, **Products**, **GA / Preview / Retirement date**, plus a link:
   - M365: `https://www.microsoft.com/microsoft-365/roadmap?searchterms=<id>`
   - Azure: `https://azure.microsoft.com/updates?id=<id>`
6. State which date field you filtered on (per the server's RESULT EXPLANATION REQUIREMENT).
7. For deep dives on a specific item, call `get_m365_roadmap_by_id` / `get_azure_update_by_id` to get the full untruncated description.

## Notes

- Server is stateless from our side — no auth, no session id needed. The helper handles SSE unwrapping.
- Don't invent roadmap items — only report what the server returns. If results are empty, say so and suggest a broader filter or `search`.
- Don't include private user data when sharing externally; this skill returns only public Microsoft roadmap content so it's safe to share verbatim.


