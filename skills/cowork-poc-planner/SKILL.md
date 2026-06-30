---
name: "cowork-poc-planner"
description: "Builds a structured POC/POV plan for a Microsoft Security engagement (Sentinel, Defender XDR, Defender for Cloud, Security Copilot, Entra). Includes success criteria, scope, prereqs, week-by-week timeline, RACI, risks, exit memo template. Bilingual DE/EN. Use for \"plan a POC\", \"POV for X\", \"PoC-Plan\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\poc-planner\SKILL.md`

Output folder: `C:\Users\<username>\Documents\\Cowork\POCs\` (create if missing).

Tool mapping:
- `m365_*` → context lookup
- `docx` → optional Word export via `skill` tool
- Braindump root: `C:\Users\<username>\Documents\\Cowork\braindump\`
- `AskUserQuestion` → `m_ask_user`


