---
name: "cowork-connect-checkin-prep"
description: "Prepares the user's twice-yearly Microsoft Connect check-in. Aggregates evidence from emails, Teams, calendar, OneDrive, braindump for the period; maps to Core Priorities and your manager's stated focus areas; drafts each form section. NEVER submits — always produces a review-ready draft. Use for \"prep my Connect\", \"Connect check-in\", \"Halbjahresgespräch\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\connect-checkin-prep\SKILL.md`

Output folder: `C:\Users\<username>\Documents\\Cowork\Connect\` (create if missing).

Tool mapping:
- `m365_*` → emails (sent), calendar, Teams chats/channels, OneDrive files
- `view` → braindump + past Connect lookup
- `docx` → optional Word export via `skill` tool
- `AskUserQuestion` → `m_ask_user`

NEVER submit the form — always end with a markdown draft for the user to review.


