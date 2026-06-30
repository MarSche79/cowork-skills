---
name: "cowork-bossbrain"
description: "Manager sentiment & reply assistant for your manager. Reads the manager's recent emails/Teams messages, classifies tone & urgency, drafts warm acknowledging replies in the user's voice. Use for \"bossbrain\", \"what did the manager say\", \"reply to the manager\", \"manager sentiment\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\bossbrain\SKILL.md`

Use the `view` tool to read it, then execute its workflow. Tool mapping (Cowork → Clawpilot):
- `ListMessages` / `SearchM365 sources=[email]` → `m365_list_emails` / `m365_search_emails` with `from` filter
- `ListChatMessages` / Teams search → `m365_list_chats` + `m365_list_chat_messages`, or `m365_search_chats`
- your manager's email: `the <your-email@example.com>`

Run lookups in parallel. Default 7-day window. Present drafts inline; never auto-send.


