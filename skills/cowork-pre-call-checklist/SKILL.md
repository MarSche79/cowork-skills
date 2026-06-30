---
name: "cowork-pre-call-checklist"
description: "Last-mile briefing ~30 min before an upcoming customer call: last 3 touchpoints, open action items (you owe / they owe), fresh product/industry angle, suggested opener. Bilingual DE/EN. Use for \"prep me for my next call\", \"pre-call checklist for [customer]\", \"was kommt als nächstes im Kalender\", \"kurzes Briefing vor dem Call\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\pre-call-checklist\SKILL.md`

Use the `view` tool to read it, then execute its workflow. Tool mapping:
- `ListCalendarView` → `m365_list_events`
- `SearchM365 sources=[email]` → `m365_search_emails`
- `SearchM365 sources=[teams]` → `m365_search_chats` + `m365_list_chat_messages`
- `ListChats` → `m365_list_chats`
- `GetUserDetails` → `m365_search_people`
- `braindump` lookups → invoke the `cowork-braindump` skill in Query mode
- `web_search` fallback → use `web_fetch` against a search engine or skip if unavailable
- `AskUserQuestion` → `m_ask_user`

Run lookups in parallel. Default 30-day window (extend to 60 if <3 touchpoints). Detect language from customer correspondence (DE for .at/.de/.ch domains or German content; else EN). Keep brief under ~300 words, cite with `[msg_X]`/`[evt_X]`/`[chat_X]` aliases.


