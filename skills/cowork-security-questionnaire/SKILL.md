---
name: "cowork-security-questionnaire"
description: "Answers cybersecurity RFI/RFP/CAIQ/SIG/vendor security questionnaires. Reads .xlsx/.docx, drafts grounded answers from braindump + MS public docs, cites every source, outputs a filled spreadsheet draft. Bilingual DE/EN. Use for \"answer this RFP\", \"fill out CAIQ\", \"Sicherheitsfragebogen\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\security-questionnaire\SKILL.md`

Use the `view` tool to read it, then execute its workflow.

Tool mapping:
- `web_fetch` → `web_fetch` tool
- `xlsx`/`docx` skills → invoke via `skill` tool
- Braindump root: `C:\Users\<username>\Documents\\Cowork\braindump\`
- `AskUserQuestion` → `m_ask_user`


