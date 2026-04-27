---
name: pre-call-checklist
description: |
  Prepares you for an upcoming customer call by surfacing the last 3
  touchpoints (emails, Teams chats, meetings) with that customer, listing
  open action items you owe them and open action items they owe you,
  and highlighting fresh product news or industry updates relevant to the
  customer's focus area (Security, Copilot, Azure, Modern Work, etc.).
  Pulls signals from Outlook, Teams, and the Outlook calendar, scoped to
  the customer's external email domain. Produces a concise structured brief
  in markdown, bilingual DE/EN depending on the customer's preferred
  language (inferred from prior correspondence).
  Use when user asks to "prep me for my next call", "pre-call checklist
  for [customer]", "who is next on my calendar", "what is next on my
  calendar", "brief me before my [customer] call", "quick brief before
  the call", or similar pre-call preparation requests.
  Do NOT use for post-call recaps (use meeting-intel), for full demo
  preparation (use demo-prep), or for broad deal reviews without a
  specific upcoming call (use deal-intelligence-brief).
cowork:
  category: productivity
  icon: "📞"
---

# Pre-Call Checklist

Produce a focused, last-mile briefing roughly 30 minutes before
an upcoming external customer call, so you walk in with full context on
recent history, open commitments, and any fresh angle worth mentioning.

## When to use

- User asks for prep for their next or a specific upcoming customer call.
- User wants a "quick brief" before walking into a meeting.
- User references "the next meeting".

Skip this skill for:
- Post-meeting recaps → `meeting-intel`
- Full demo preparation with talking points → `demo-prep`
- Broad opportunity reviews without a specific call → `deal-intelligence-brief`

## Inputs

- **Target call** — either explicitly named by the user ("the call with
  Contoso") or resolved from the calendar as the next external meeting.
- **Customer identity** — derive the customer from the external attendee
  domain of the target event.
- **Lookback window** — 30 days by default. Extend to 60 days if < 3
  touchpoints are found.
- **Language** — DE if the majority of prior correspondence with this
  customer is in German, otherwise EN. State the detected language at
  the top of the brief.

## Resolution steps

1. **Identify the target call.**
   - If the user named a customer: `ListCalendarView` for the next 7 days
     and pick the first event whose attendees include that customer's
     external domain.
   - Otherwise: `ListCalendarView` for today + tomorrow and pick the next
     upcoming event that has at least one external attendee (domain
     outside your organization).
   - If no upcoming external call is found, tell the user and stop.

2. **Identify the customer.**
   - Take the dominant external domain from the event's attendees.
   - Resolve the primary external attendee via `GetUserDetails` if
     needed to get a clean display name and company.

3. **Gather the last 3 touchpoints (parallel where possible).**
   - Emails: `SearchM365` with `sources: ["email"]`, filtered by the
     customer's domain, sorted by most recent. Take up to the 3 most
     recent threads.
   - Teams chats: `SearchM365` with `sources: ["teams"]` scoped to the
     customer's domain, plus `ListChats` if the user has 1:1 or group
     chats with that customer; grab the latest 1-2 chat threads.
   - Calendar: `ListCalendarView` for the past 30 days, filter events
     where the customer's domain appears among attendees; take the most
     recent 1-2.
   - Merge, de-duplicate, and keep only the 3 most recent distinct
     touchpoints overall.

4. **Extract open action items.**
   - From the retrieved emails, meeting notes, and Teams chats, extract
     concrete commitments. Separate into:
     - **You owe customer** — anything you promised to send, draft,
       schedule, follow up on, confirm, etc.
     - **Customer owes you** — anything the customer said they would
       provide (sign-offs, data, access, feedback, decisions).
   - Only include items that have no evidence of being closed in later
     messages.

5. **Fresh product / industry angle.**
   - Determine the customer's focus area from prior correspondence
     (Security, Copilot, Modern Work, Azure, Data & AI, etc.).
   - Pull 1-3 recent, relevant items from the user's knowledge base
     (braindump notes) under that topic. If nothing useful, fall back
     to a short `web_search` for recent news (last 30 days) on the topic
     — only include results with a clearly dated recent source.
   - Do **not** fabricate product news. If no fresh angle is available,
     say so explicitly.

## Output format

Render as markdown directly in chat (no file). Structure:

```
### 📞 Pre-Call Checklist — <Customer> (<language: DE|EN>)
**Meeting:** [evt_X]
**When:** <local time> · **With:** <external attendees>, <internal attendees>

**Last 3 touchpoints**
- [msg_A] — <1-line summary>
- [chat_B] — <1-line summary>
- [evt_C] — <1-line summary>

**You owe them**
- <action item> — source: [msg_X]
- ...
- _None identified._ (if applicable)

**They owe you**
- <action item> — source: [msg_Y]
- ...
- _None identified._ (if applicable)

**Fresh angle**
- <1-3 bullets, each with source or knowledge base reference>
- _No fresh item to highlight._ (if applicable)

**Suggested opener**
<one sentence you can use to kick off the call, in the detected language>
```

If the detected language is DE, translate all section headings and the
opener to German (e.g., "Letzte 3 Kontaktpunkte", "Du schuldest ihnen",
"Sie schulden dir", "Aktueller Aufhänger", "Vorschlag für den Einstieg").
Keep the customer-facing opener natural and non-salesy.

## Rules

- Always use bracketed context aliases ([evt_X], [msg_X], [chat_X]) —
  never bare IDs, never repeat the display name next to an alias.
- Do not evaluate the customer or individual people; focus on facts.
- If any section has no data, show the empty-state line ("_None
  identified._") rather than omitting the section.
- Never fabricate product news, quotes, or commitments. If evidence is
  thin, say so.
- Keep the whole brief under ~300 words so it stays scannable 30
  minutes before a call.
