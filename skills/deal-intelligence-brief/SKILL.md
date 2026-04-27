---
name: deal-intelligence-brief
description: |
  Generates a concise, actionable deal briefing from emails, meetings, Teams chats,
  and files to prepare for customer interactions and advance opportunities.
  Aggregates recent signals (last 60 days by default), maps internal and external
  stakeholders, flags risks and blockers, and recommends prioritized next actions.
  Use when user asks to "prep me for the [customer] call", "deal brief on [X]",
  "status on the [customer] opportunity", "what do I know about [account]",
  "brief me on the deal", "customer intelligence", "deal review for [customer]",
  "intel on [company]", or needs pre-meeting or internal deal-review context.
  Do NOT use for generic meeting prep (use meeting-intel) or for sending
  stakeholder updates (use stakeholder-comms).
cowork:
  category: analysis
  icon: briefcase
---

## Goal
Produce a structured **Deal Intelligence Brief** that enables you to quickly understand:
- Current status of the deal
- Risks and blockers
- Key stakeholders (internal and external)
- Next best actions

Usable directly for:
- Customer meeting preparation
- Internal deal reviews / pipeline calls
- Live customer conversations

---

## How to work

### 1. Resolve the target
- If the customer, deal, or account is not explicit, ask once via `AskUserQuestion`.
- Disambiguate by **email domain** first (e.g., `@contoso.com`), then by account name.
- If multiple candidates, present options with last-activity dates and let the user pick.

### 2. Gather context (run lookups in parallel)
Default lookback: **last 60 days**. If activity is sparse, extend to **6 months**.

Pull in parallel via subagents or parallel tool calls:
- **Outlook**: `SearchM365` with `sources=["email"]` filtered by customer domain and/or account name
- **Calendar**: `ListCalendarView` over the lookback window; filter events with external attendees from the customer domain
- **Teams**: `SearchM365` with `sources=["teams"]` for chats/channels mentioning the customer
- **Files**: `SearchM365` with `sources=["files"]` for documents tagged with the customer or deal name
- **People**: `SearchPeople` / `GetUserDetails` to resolve internal roles for anyone mentioned

Prefer the most recent signals. Always cite each claim with a context-link alias (`[msg_3]`, `[evt_12]`, `[file_4]`).

### 2b. External customer intel — handoff to the Sales agent (optional)

If you have access to a Sales intelligence agent (e.g., Microsoft Sales Copilot), you can do a **manual handoff**:

1. After the internal lookups in step 2, assemble a short, copy-ready prompt for the Sales agent. It should include:
   - Customer / account name and domain
   - Deal context in 1–2 sentences (stage, product area)
   - 3–5 targeted questions about what's **missing from internal signals**
2. Present the prompt to the user in a fenced code block.
3. **Pause** the brief generation. Do not fabricate external customer facts — internal-only sections may still be drafted.
4. When the user pastes the Sales agent response back:
   - Treat it as a retrieved source tagged `[sales_agent]`
   - Merge into **Customer Context** and **Competitive Intelligence** sections
   - Keep attribution clean

**Skip the handoff** if the user says "skip sales agent", "internal only", or the request is clearly internal-review-only.

### 3. Ground every claim
- Never invent facts. If unclear, mark as **"(unknown)"** or flag as an open question.
- Do not infer budget, timelines, or sentiment unless directly stated or strongly implied by cited evidence.
- Focus on **actionability, not summarisation**.

### 4. Privacy
- Exclude content from private Teams channels the user did not explicitly reference.
- Do not surface details from calendar events marked private.
- Flag (but do not quote) any content marked confidential or sensitivity-labeled.

---

## Output

**Default format:** inline markdown in chat.
**If the user says "as a doc" / "Word doc" / "share with team":** route through the `docx` skill after producing the brief.

### 1. Executive Summary (max 5 bullets)
- Deal in one line (customer, product/solution, stage)
- Current status (e.g., discovery, active PoC, negotiation, at risk, closing)
- Why it matters (customer business outcome / strategic value)
- Top risk in one phrase
- Top next action in one phrase

---

### 2. Customer Context
- Customer overview from available context (never from pre-training)
- Industry / business drivers — only if confidently grounded
- Current challenges or needs identified, each tied to a cited source

---

### 3. Deal Snapshot
- Opportunity / project description
- Scope (products, solutions, focus area)
- Timeline indicators (if mentioned) — cite source
- Budget or urgency signals (if stated) — cite source
- Deal stage and momentum (accelerating / steady / stalled)

---

### 4. Stakeholder Map

**Customer side**
| Name | Role | Engagement | Notes |
|------|------|------------|-------|
- Engagement levels: **Active/supportive**, **Neutral/unclear**, **Missing/gap**
- Call out: economic buyer, champion, technical evaluator, blocker (if identifiable)

**Your side**
| Name | Role | Involvement |
|------|------|-------------|
- Include account exec, SE, CSM, specialists seen in threads/meetings

**Gaps**
- Missing stakeholders or weak engagement on either side

---

### 5. Signals from Recent Activity
Summarise, with cited aliases:
- **Emails**: key threads, tone shifts, open questions
- **Meetings**: decisions, follow-ups promised, attendee patterns
- **Chats**: informal signals, urgency cues

Highlight:
- Customer sentiment (positive / neutral / negative) + evidence
- Repeated questions or concerns
- Decision signals (budget, timeline, urgency)

---

### 6. Risks & Blockers
List with severity **High / Medium / Low**:
- Technical risks
- Commercial risks
- Organisational / stakeholder risks

Each risk must reference the signal or gap that surfaced it.

---

### 7. Competitive Intelligence (if relevant)
- Competitors mentioned or implied — cite source
- Differentiation angle if clearly grounded
- Skip this section entirely if no evidence exists (do not speculate)

---

### 8. Recommended Next Actions
3–5 concrete, prioritized actions. Each must:
- Be specific (who to contact, what to send, what to clarify)
- Be tied to a signal, gap, or risk above
- Include a suggested timeframe (today / this week / before next meeting)

Example format:
1. **[This week]** Follow up with [stakeholder] to confirm PoC scope — unresolved since [msg_7].
2. **[Before next meeting]** Prepare pricing options — budget range mentioned in [evt_3] but not confirmed.

---

## Guardrails
- Ground every factual claim in a retrieved source. No pre-training facts about the customer.
- If a section has no grounded evidence, write "No signals found in the last 60 days" rather than filling with generic content.
- Never surface private event details or confidential labels verbatim.
- If the user asks follow-ups ("draft an email to the champion"), hand off to appropriate communication tools rather than expanding this brief.
