---
name: "cowork-externe-followups"
description: "Findet unbeantwortete externe Kunden-/Partner-Threads (Outlook + Teams) der letzten 21 Tage, filtert interne Microsoft-Absender und Marketing/Newsletter raus, sortiert in 3 Prioritätsgruppen. Use für \"externe Follow-ups\", \"offene Kundenanfragen\", \"was habe ich noch nicht beantwortet\", \"customer followup list\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\externe-followups\\SKILL.md`

Use the `view` tool to read it, then execute its workflow. Tool mapping:
- Outlook scan → `m365_list_emails` (folder=inbox, date range last 21 days, paginate via `skip`)
- Thread analysis → check `from` of latest message in each conversation; exclude where last sender is the <your-email@example.com>
- `ListChats` / Teams scan → `m365_list_chats` (paginate with `skipToken`) + `m365_list_chat_messages`
- `QueryGraph` for chat members/tenantId → not directly available; use `m365_get_chat` to inspect members and tenant info, fall back to UPN domain check
- Microsoft tenant ID: `<TENANT_ID>`
- the user's email: `<your-email@example.com>`
- Vendor aliases (`v-*@microsoft.com`) = INTERNAL, always ignore
- Output as inline markdown list grouped by 3 priority buckets; if user asks "schick als Mail" → use `m365_send_email` to himself with HTML body

