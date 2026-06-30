---
name: "cowork-deal-intelligence-brief"
description: "Generates a structured Deal Intelligence Brief for a customer/account from emails, meetings, Teams, and files. Includes stakeholder map, signals, risks, next actions. Use for \"prep me for the [customer] call\", \"deal brief on [X]\", \"status on [customer] opportunity\", \"intel on [company]\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\deal-intelligence-brief\SKILL.md`

Use the `view` tool to read it, then execute its workflow. Tool mapping (Cowork → Clawpilot):
- `SearchM365 sources=[email]` → `m365_search_emails` (filter by domain in `from` or `query`)
- `SearchM365 sources=[teams]` → `m365_search_chats` + `m365_list_chat_messages`
- `SearchM365 sources=[files]` → `m365_search_files`
- `ListCalendarView` → `m365_list_events` with date range
- `SearchPeople` / `GetUserDetails` → `m365_search_people` / `m365_get_my_profile`
- `AskUserQuestion` → `m_ask_user`

Run lookups in parallel. Default 60-day window. The Sales-agent handoff (Section 2b) requires the user to copy a prompt into M365 Copilot — present the prompt and pause for his paste-back. Cite every claim with `[msg_X]`/`[evt_X]`/`[file_X]` aliases.


