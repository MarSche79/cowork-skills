---
name: "cowork-sentinel-sizing"
description: "Estimates Microsoft Sentinel ingestion volume + monthly cost from a customer profile. Outputs sizing table, pay-as-you-go vs commitment-tier comparison, retention costs, optimization tips. Always fetches live Azure pricing. Use for \"size Sentinel for X\", \"Sentinel cost estimate\", \"Sentinel pricing\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\sentinel-sizing\SKILL.md`

Output folder: `C:\Users\<username>\Documents\\Cowork\Sizings\` (create if missing).

Tool mapping:
- `web_fetch` → ALWAYS fetch live Azure pricing from https://azure.microsoft.com/en-us/pricing/details/microsoft-sentinel/ — never hardcode prices.
- `xlsx` → optional Excel output via `skill` tool
- Braindump root: `C:\Users\<username>\Documents\\Cowork\braindump\`
- `AskUserQuestion` → `m_ask_user`


