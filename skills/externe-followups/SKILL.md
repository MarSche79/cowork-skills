---
name: externe-followups
description: |
  Finds unanswered messages from external customers and partners in Outlook
  and Teams from the last 2-3 weeks, filters out internal senders and
  automated emails, and delivers a prioritized follow-up list
  (urgent, older than 7 days, other) as chat output or email.
  Use when user asks to "check open customer threads", "unanswered external
  messages", "external followups", "open customer requests", "what haven't
  I replied to", "customer threads without reply", or similar requests
  focused on open external conversations.
cowork:
  category: productivity
  icon: mail
---

# External Follow-ups

Delivers a prioritized list of all open external conversations that
you haven't replied to yet — from Outlook and Teams combined.

## How it works

1. **Scan Outlook inbox** (last 21 days)
   - Only emails from external senders (all domains outside your
     organization's primary domain).
   - **Vendor/contractor aliases should be treated as INTERNAL** even if
     the display name shows an external company. Check the actual email
     domain, not the display name.
   - Include both read and unread messages.
   - Use pagination to cover the full time range.

2. **Thread analysis**
   - For each thread, check whether the last message was NOT sent by you.
   - Exclude threads where you already replied last.

3. **Scan Teams chats** (last 21 days)
   - **Go through ALL chats, not just the first pages.** Paginate through
     `ListChats` (follow `next_link` to the end) OR use `QueryGraph`
     with `/me/chats?$expand=members&$top=50` to load members upfront.
   - **Identify external chats by tenant ID (primary criterion).**
     Your organization's tenant ID should be configured. Any chat whose
     members include at least one different `tenantId` is a
     federated/external chat and must be scanned.
     Additionally as fallback: check email/UPN domain.
   - **Important: don't rely on `lastUpdatedDateTime`.** For federated
     1:1 chats, Graph often reports outdated values. Therefore, for
     EVERY chat identified as external, load `ListChatMessages` for
     the last 21 days — regardless of the reported "last updated".
   - If `ListChatMembers` fails for a chat (e.g., `thread.tacv2`,
     channel threads), fall back to `QueryGraph /me/chats/{id}/members`.
   - Include chats where the last message is from an external
     participant and hasn't been replied to by you.

4. **Filter out noise** (REMOVE from results list)
   - Marketing newsletters and promotions
   - Automated notifications, calendar invitations, system emails
     (`no-reply@`, `notifications@`, `marketing@`, `newsletter@`,
     `feedback@`, `reservations@`).
   - Transactional emails (booking confirmations, invoices without
     personal follow-up needed).
   - Social media platform emails (LinkedIn, Xing, etc.).

5. **Sort into three priority groups**
   - **Group 1 - Urgent/Time-critical**: explicit follow-ups, reminders,
     deadlines, escalations. Signal words: "urgent", "please reply by",
     "Reminder", "Follow-up", "ASAP".
   - **Group 2 - Older open threads**: older than 7 days without reply.
   - **Group 3 - Other open threads**: all remaining.

6. **Format per entry**
   - Customer name / company (derived from sender domain or Teams participant)
   - Subject or chat topic
   - Date of last incoming message (DD.MM.YYYY)
   - Brief context (one sentence: what it's about or what's expected)

## Output

- **Default:** Inline in chat as a structured list with three headings.
- **On request** ("send as email", "via email"): HTML-formatted email to
  the user with subject "Follow-up List: Unanswered External Messages - [Date]".
- If no open threads are found, confirm this explicitly.

## Notes

- External domain = anything that is not your organization's domain.
- **Vendor/contractor aliases using your org's domain are INTERNAL and
  should always be ignored.** The domain matters, not the display name.
- **Teams: Identify external chats primarily via tenant ID.** Configure
  your org's tenant ID; any different `tenantId` means federated/external.
  Chat titles with customer names are NOT proof — those are often
  internal coordination chats.
- **Teams: `lastUpdatedDateTime` is unreliable** for federated 1:1 chats.
  Always load messages for the last 21 days individually, regardless of
  the reported timestamp in the chat list.
- Marketing, newsletter, event reminders, booking confirmations, and
  social media notifications are removed from the results list — even
  if the sender domain is technically external.
- Default time range: 21 days; adjustable on request (e.g., "last week").
- Output language follows the user's input language (German or English).
