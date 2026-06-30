---
name: "cowork-competitor-watch"
description: "Monitors public moves by Microsoft Security competitors (CrowdStrike, Palo Alto, SentinelOne, Splunk, Wiz, Okta, Chronicle, Datadog Security, Rapid7). Pulls vendor newsrooms + web search, classifies signals, adds \"So what for MS\" lens, suggests battle-card updates. Use for \"competitor watch\", \"what's new at CrowdStrike\", \"battle card update\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\competitor-watch\SKILL.md`

Output folder: `C:\Users\<username>\Documents\\Cowork\competitor-watch\` (create if missing).

Tool mapping:
- `web_fetch` → vendor newsrooms + web search (PUBLIC sources only — never internal MS competitive files)
- Braindump root: `C:\Users\<username>\Documents\\Cowork\braindump\` (cross-reference `competitors-<vendor>` topics)
- `cowork-braindump` skill → optional persistence of new signals
- `AskUserQuestion` → `m_ask_user`


