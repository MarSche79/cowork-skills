---
name: "cowork-demo-prep"
description: "Prepares the user for an upcoming customer demo: profiles attendees, extracts requirements/pain points/competitors from prior emails+Teams+files, recommends demo angles. Bilingual DE/EN. Use for \"prep me for the [customer] demo\", \"Demo-Vorbereitung für [Kunde]\", \"what should I show [customer]\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\demo-prep\SKILL.md`

Use the `view` tool to read it, then execute its workflow. Tool mapping:
- `ListCalendarView` → `m365_list_events`
- `SearchM365 sources=[email]` → `m365_search_emails`
- `SearchM365 sources=[teams]` → `m365_search_chats` + `m365_list_chat_messages`
- `SearchM365 sources=[files]` → `m365_search_files`
- `SearchPeople` / `GetUserDetails` → `m365_search_people`
- `GetMessage` → `m365_get_email`
- `AskUserQuestion` → `m_ask_user`

Run lookups in parallel. Choose output language based on customer domain (.at/.de/.ch → DE, else EN). Cite with `[msg_X]`/`[evt_X]`/`[file_X]` aliases.


