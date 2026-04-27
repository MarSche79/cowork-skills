---
name: demo-prep
description: |
  Prepares you for customer demos by aggregating prior Outlook emails, Teams
  chats, and calendar history with the customer; extracting their stated technical
  requirements, pain points, and competitive context (competitors mentioned,
  alternatives under evaluation); profiling the attendees of the upcoming demo
  (role, prior interactions, last touchpoint); and proposing targeted demo talking
  points and product angles to emphasize. Produces a concise structured brief in
  markdown, bilingual DE/EN depending on the customer's language.
  Use when user asks to "prep me for the [customer] demo", "demo prep for [X]",
  "prepare the demo with [customer]", "what should I show [customer]",
  or similar pre-demo preparation requests.
  Do NOT use for generic meeting prep (use meeting-intel), for post-demo recaps
  (use meeting-intel), or for broad deal status without a specific upcoming demo
  (use deal-intelligence-brief).
cowork:
  category: productivity
  icon: lightning
---

## Overview

Given a customer name and/or an upcoming demo meeting, this skill aggregates
prior M365 signals (email, Teams, calendar, files) to produce a focused
pre-demo brief: who will be in the room, what they've already told us,
what they're worried about, who they're comparing us to, and what to show
to move the deal forward.

## When to Use

- User has an upcoming customer demo and wants to walk in prepared
- User needs to know what the customer has already seen / been told
- User wants to sharpen the demo narrative around known pain points
- User wants competitive context (what alternatives the customer mentioned)

## When NOT to Use

- Generic meeting prep with no product demo component → use `meeting-intel`
- Post-demo summary or action items → use `meeting-intel`
- Portfolio-level deal review without a specific upcoming demo → use `deal-intelligence-brief`
- Drafting a follow-up email after the demo → use `stakeholder-comms`

## Quick Start

```
User: "Prep me for the Contoso demo on Thursday"
1. Resolve customer + meeting: find upcoming calendar event with "Contoso"
   in attendees/subject (ListCalendarView), extract external domain(s)
2. Identify attendees: for each external attendee, GetUserDetails + SearchPeople
3. Gather history (parallel): SearchM365 across email/teams/files filtered by
   external domain, last 90 days
4. Extract signals: requirements, pain points, competitors, prior demos given
5. Draft brief in customer's language (DE if German-speaking org, else EN)
6. Present inline as markdown
```

## Core Instructions

### Step 1: Resolve Inputs

Accept any of:
- **Customer name** (e.g., "Contoso", "Fabrikam") — fuzzy match
- **Meeting reference** (e.g., "Thursday demo", event alias `evt_X`)
- **Both** (preferred)

Resolution order:
1. If a meeting is mentioned, call `ListCalendarView` for the next 14 days and
   locate the event by subject/attendee match. Extract the external domain(s)
   from attendees.
2. If only a customer name is given, search calendar for upcoming events with
   that name in subject/attendees; if none, proceed without an anchor event.
3. If multiple candidate customers or events match, ask the user to pick via
   `AskUserQuestion`.

Capture:
- Customer org name + primary email domain
- Event date/time/location (if found)
- Internal attendees (your side)
- External attendees (customer side)

### Step 2: Profile Attendees

For each **external** attendee (parallel):
- `GetUserDetails` / `SearchPeople` by email to get name, title, company
- `SearchM365` with `from_user=<email>` and `sources=["email","teams"]`, last 180 days,
  to find prior interactions and topics they've raised
- **Signature mining**: If `SearchPeople` returns no title (common for external
  contacts), fetch the 2–3 most recent emails they sent or were CC'd on.
  Parse the email **signature block** at the bottom of the body for role,
  department, and phone.
- **Salutation signal**: Formal vs. informal greeting style indicates
  relationship depth — note in output.

For each **internal** attendee: name + role only (no deep profile).

Mark each external attendee with:
- Role (decision maker / technical evaluator / champion / unknown)
- Last touchpoint (date + medium)
- Topics they personally raised
- Evidence source for role (signature / directory / inferred from context / unknown)

### Step 3: Gather Customer History (parallel)

Run these in parallel via `SearchM365`, scoped to the customer's email domain
or org name, last 90 days (extend to 180 if thin):

- `sources=["email"]` — all threads with the customer
- `sources=["teams"]` — chat/channel mentions
- `sources=["files"]` — shared decks, RFPs, architecture docs
- `sources=["calendar"]` — prior meetings (to count prior demos / workshops)

Also check if `deal-intelligence-brief` has cached signals for this customer.

### Step 4: Extract Signals

From the retrieved content, extract and cite (with message/file alias):

**Technical requirements** — what the customer said they need
(integrations, workloads, compliance, scale, data residency, SLAs).

**Pain points / drivers** — what's broken today, business outcomes they want.

**Competitive context** — named competitors, alternative products mentioned,
RFP shortlists, "we also looked at…".

**Adjacent-deal signals (fallback when no direct competitors found)** —
if the direct customer history contains no named competitors, scan for
parallel deals at **industry peers**. Use `SearchM365` across email + Teams
in the last 90 days with queries built from the customer's sector cohort.
Report as "no direct competitive signals — peers currently evaluating:
[X at peer Y from msg_Z]".

**Prior demos / material shown** — what they've already seen (avoid repeating).

**Open questions / objections** — unresolved concerns, pushback.

**Commercial signals** — budget, timeline, decision process (if mentioned).

Every bullet in the brief must trace to a retrieved message/file. If a
section has no signal, say "No signals found in the last 90 days" — do not
bridge gaps with assumptions.

### Step 5: Recommend Demo Angles

Based on extracted signals, propose 3–5 **talking points / demo moments** that:
- Directly address a stated pain point or requirement
- Differentiate against the named competitor(s)
- Avoid repeating what was already demoed
- Are tailored to the seniority mix of attendees (exec vs. technical)

For each angle, state: *what to show* → *why it lands* (which signal it maps to).

### Step 6: Present

Output as inline markdown (no file). Use this structure:

```markdown
# Demo Prep — <Customer> (<date if known>)

## Meeting
- When / where / format
- Duration
- Your attendees: <names>
- Customer attendees: <N> (see below)

## Customer Attendees
| Name | Title | Role | Last Touch | Notes |
|------|-------|------|-----------|-------|
| ...  | ...   | DM / Tech / Champion | <date> | Topics they raised |

## What They've Told Us
**Requirements**
- [requirement] — <source alias>

**Pain points**
- [pain] — <source alias>

**Already seen / demoed**
- [prior demo topic] — <source alias>

## Competitive Context
- [Competitor / alternative] — <source alias>
- [Concerns about us] — <source alias>

## Open Questions / Objections
- [item] — <source alias>

## Recommended Demo Angles
1. **Show**: [feature / scenario]
   **Why**: maps to [signal]
   **Watch for**: [competitor differentiation]
2. ...

## Pre-Demo Checklist
- [ ] Confirm environment / tenant / data set
- [ ] Prepare answer to open objection: "<objection>"
- [ ] Bring <asset> they asked for
```

### Language

- If the customer's org is clearly German-speaking (.at, .de, .ch domain, or
  communication history is in German) → write the brief in German.
- Otherwise → English.
- Internal tool names and product names stay in their original form.

## Guardrails

- Cite every factual claim with a retrieved message/file alias — no fabrication.
- Use bracketed aliases `[msg_3]`, `[evt_7]`, `[file_2]` for all references.
- If the customer org cannot be resolved unambiguously, ask via `AskUserQuestion`
  before proceeding.
- Never expose internal competitor intelligence or NDA-bound content that
  doesn't appear in your own retrieved data.
- Do not evaluate individual customer employees' performance or competence —
  only map their role and stated positions.
- Keep the brief dense and skimmable: aim for one screen of markdown.
