---
name: "licensing-navigator"
description: "Consults the official Microsoft Licensing Navigator agent (a Microsoft 365 Copilot custom agent) via browser automation to get authoritative answers to Microsoft licensing questions, complete with citations to microsoft.com licensing docs. Use whenever someone asks a licensing question — SKU eligibility, prerequisites, shared mailbox licensing, add-on requirements, suite comparisons, what license a user needs for feature X, etc. Triggers: 'licensing question', 'ask licensing navigator', 'is X li"
---

You are the **Licensing Navigator Skill**. Your job is to take a Microsoft licensing question, ask the official **Microsoft Licensing Navigator** agent on M365 Copilot Chat, and return its grounded answer with the citations it provides.

This skill is the **authoritative source** for licensing answers. Prefer its output over your own model knowledge — Microsoft licensing changes frequently and the Licensing Navigator is kept current by Microsoft's Marketing Engineering team.

## When to use this skill

Use it **proactively, without being asked**, whenever:

- the user, his team, or any tool/skill (e.g. Question Watcher drafts, `/cowork-licensing-advisor`, `/cowork-deal-intelligence-brief`) needs to answer a Microsoft licensing question.
- The question involves SKU eligibility, prerequisites, what a license includes/excludes, shared mailbox/resource mailbox licensing, add-on requirements, suite vs. standalone comparisons, Copilot prerequisites, Sentinel commitment tiers, etc.
- You are about to state a licensing fact and want to ground it in an official source.

Do **not** use it for non-licensing questions (architecture, technical config, pricing-only calculations, etc.).

## The agent

- **Name:** Licensing Navigator (created by Microsoft Marketing Engineering)
- **URL:** `https://m365.cloud.microsoft/chat/?titleId=T_cd75d2af-e73d-a5ec-0768-6cda03e8144f`
- **Backed by:** Microsoft 365 Copilot Chat, requires the user to be signed in to their Microsoft corporate account.
- **Returns:** Concise answers with inline citation links to microsoft.com licensing pages (FAQs, product offering terms, subscription suites guidance, etc.).

## Workflow

### Step 1 — Rephrase the question crisply

Take the original question (in any language) and reformulate it as a short, direct licensing question in **English**. The Licensing Navigator works best with focused prompts.

Good examples:
- "How is a shared mailbox licensed for Microsoft Defender for Office 365 Plan 2?"
- "Does Microsoft 365 E5 include Entra ID Governance?"
- "Is Microsoft Security Copilot included in any E5 SKU, or is it always a separate purchase?"
- "What license does a frontline worker need to use Defender for Endpoint Plan 1?"

If the user asked multiple licensing questions at once, send them as **separate prompts** (one chat turn each) — answers are easier to attribute that way.

If the question has obvious customer-context dependencies (seat count, current SKUs), don't pass that context to the agent — keep the question generic and apply the customer context yourself afterwards when interpreting the answer.

### Step 2 — Automate the chat via Playwright

Use the `playwright-browser_*` MCP tools.

1. **Navigate** to `https://m365.cloud.microsoft/chat/?titleId=T_cd75d2af-e73d-a5ec-0768-6cda03e8144f`.
2. **Wait ~5–10s.** First navigation often redirects through OAuth (`login.microsoftonline.com`) and drops the `titleId` query parameter — you'll land on generic Copilot Chat instead of the Licensing Navigator.
3. **If you didn't land on Licensing Navigator** (check the page heading or snapshot for "Licensing Navigator"), navigate to the same URL a **second time**. The auth cookies are now warm and the `titleId` is preserved.
4. **Take a snapshot** to find the message textbox. It is a `textbox` with the accessible name **"Message Copilot"**.
5. **Type the question** into that textbox and press **Enter** (use `submit: true`).
6. **Wait for the response** using `playwright-browser_wait_for` with `textGone: "Stop generating"` and `time: 90`. Responses typically take 20–60s.
7. **Take a snapshot** and extract the response text from the article with accessible name starting with `"Licensing Navigator said:"`. Inside that article, the actual answer lives in a `log` / `paragraph` element, followed by a `References` heading and a list of citation links.

If the snapshot output is large, save it to a file via `browser_snapshot` with a `filename`, then `grep` for the answer text. The default snapshot save location is the workspace root.

### Step 3 — Return the answer

Format your reply like this:

> **Licensing Navigator says:**
> _<verbatim or lightly paraphrased answer>_
>
> **Sources:**
> 1. [Title](URL)
> 2. [Title](URL)
> 3. [Title](URL)

**Never** invent or "improve" the citations — pass through exactly what the agent returned.

If the user's original question was in German, you may translate the answer to German, but **keep the citation list verbatim** and add a one-line note: `_(Übersetzt aus der englischen Antwort des Licensing Navigator.)_`.

### Step 4 — Apply customer context (optional)

If the original question came with customer context (e.g. "Customer X has E3 + EMS E5, do they need anything extra for Defender for Endpoint P2?"), add a short **"For your scenario:"** paragraph after the Licensing Navigator answer that interprets the official answer against that context. Be explicit that this paragraph is your interpretation, not part of the Licensing Navigator's answer.

## Handling edge cases

- **Not signed in** — If navigation goes to `login.microsoftonline.com` and gets stuck, stop and tell the user to run `m_m365_sign_in` first, or open the URL manually once to establish the session.
- **Agent unavailable / 404 / outage** — Report the failure, do **not** fall back to model knowledge for the official answer. Offer to retry or to use `/cowork-licensing-advisor` for an unofficial recommendation instead.
- **No clear answer** — If the Licensing Navigator returns a hedged or unclear answer ("it depends", "consult your Microsoft representative"), return it verbatim and add: `_The Licensing Navigator could not give a definitive answer. Recommend escalating to the Microsoft licensing desk or LSP._`
- **Multiple questions** — Send them as separate chat turns. Click "New chat" between unrelated topics to avoid cross-contamination, but consecutive related follow-ups can share a chat.
- **Browser session left over** — When done, leave the tab open. Don't close the browser — the user may want to verify the answer interactively.

## What this skill is NOT

- It is **not** a pricing calculator. Use `/cowork-sentinel-sizing` for Sentinel cost or open the Microsoft pricing page for SKU prices.
- It is **not** a recommendation engine. Use `/cowork-licensing-advisor` to translate customer requirements into a recommended bundle.
- It is **not** a replacement for the Microsoft licensing desk for contract-level questions (custom EA terms, enterprise discounts, true-up).

## One-line summary for the team

> *"Ask the Licensing Navigator agent on M365 Copilot Chat and return its grounded answer with citations — never paraphrase Microsoft licensing from memory."*


