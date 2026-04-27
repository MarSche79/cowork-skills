---
name: security-questionnaire
description: |
  Answers cybersecurity RFI / RFP / security questionnaires (CAIQ, SIG, custom
  vendor security forms) in spreadsheet form. Reads each question row, drafts
  a grounded answer using the user's knowledge base + Microsoft
  public security documentation, cites the source for every answer, and
  outputs a filled .xlsx ready for review. Bilingual DE/EN.
  Use when the user says "answer this RFP", "fill out this CAIQ", "SIG
  questionnaire", "vendor security questionnaire", "security questionnaire",
  "RFI answer".
---

# Security Questionnaire — RFI/RFP/CAIQ Answering

End-to-end workflow for filling cybersecurity questionnaires from customers.

---

## Inputs the user must provide

1. **The questionnaire file** — path to `.xlsx`, `.xlsm`, `.csv`, or `.docx`.
2. **The customer/account name** — used for tone, sector context, deal-intel lookup.
3. *(Optional)* **Sheet/range** if the file has multiple tabs.
4. *(Optional)* **Answer language** — defaults to the language of the questions.

If any are missing, ask via `AskUserQuestion`.

---

## Step 1 — Parse the questionnaire

- Use the `xlsx` skill (or `docx`) to read the file.
- Auto-detect column layout. Common shapes:
  - **Question | Answer | Reference**
  - **ID | Domain | Question | Response | Comments**
  - CAIQ v4: **Question ID | CCM Domain | Question | Yes/No/NA | Notes**
  - SIG: tabbed by domain, Question + Response columns
- If layout is ambiguous, show the first 5 rows and ask the user to confirm column mapping with `AskUserQuestion`.

## Step 2 — Classify each question

Tag every question with one of:
- `factual` — needs a specific product fact (e.g., "Does Defender XDR support SAML SSO?")
- `policy` — needs a policy/standard reference (e.g., "Do you encrypt data at rest?")
- `architectural` — needs a diagram or design statement
- `compliance` — maps to ISO 27001 / SOC 2 / PCI / NIS2 / DORA / GDPR
- `commercial` — pricing, SLAs, support tiers
- `customer-specific` — depends on *their* deployment, not a general answer → flag for human input

## Step 3 — Draft answers with grounding

For each question:

1. **Search the knowledge base first** (braindump) — read `index.md`, then matching topic files.
2. **If not in knowledge base**, do a `web_fetch` against authoritative sources:
   - `learn.microsoft.com/security`
   - `learn.microsoft.com/azure/sentinel`, `/defender-xdr`, `/defender-cloud`, `/defender-office-365`
   - `learn.microsoft.com/compliance`
   - `servicetrust.microsoft.com` (compliance reports)
   - `microsoft.com/trust-center`
3. **Never fabricate**. If no grounded answer exists, write `[NEEDS HUMAN INPUT]` + a brief note on what's missing.

Answer format per cell:
```
<Concise answer in 1–4 sentences, matching the form's tone>

Source: <URL or knowledge base topic>
```

## Step 4 — Compliance mapping (optional add-on)

If the questionnaire is compliance-flavored (CAIQ, SIG, ISO mapping), add a sidecar column mapping each answer to the relevant control family (e.g., ISO 27001 A.8.24, SOC 2 CC6.1).

## Step 5 — Output

- Write the filled spreadsheet to **the same folder as the input**, with suffix `_DRAFT_<YYYY-MM-DD>.xlsx`.
- Preserve original formatting, sheet structure, and unanswered cells (don't overwrite, append in a new column if "Response" is locked).
- Generate a **summary report** (markdown, returned in chat):
  - ✅ N answered with high confidence
  - 🟡 N answered with medium confidence (review)
  - 🔴 N flagged `[NEEDS HUMAN INPUT]`
  - 📊 Top 3 compliance frameworks touched

## Step 6 — Confirm to user

Plain-language summary:
> "Drafted **127 of 142** answers. **15 need your input** (mostly customer-deployment specifics on rows 23, 47, 88…). File saved to: `<path>`. Want me to walk through the 15 flagged rows now?"

---

## Quality rules

- **Cite every answer.** No source = no answer.
- **Privacy:** never include private data (calendar, internal email content) in a customer-facing answer.
- **Tone match:** match the form's formality. CAIQ = terse, vendor RFPs = full sentences, German forms = formal "Sie".
- **Don't promise what doesn't exist:** if a feature is in private preview, say "private preview" — never "GA".
- **Version specifics:** capture exact product/feature names + GA dates; don't say "recently added".
- **Customer-specific questions** (e.g., "How many endpoints will you protect?") always go to `[NEEDS HUMAN INPUT]`.

## Tool mapping

- `web_fetch` → `web_fetch`
- `xlsx` → invoke via `skill` tool
- `docx` → invoke via `skill` tool
- `Read knowledge base` → `view` tool
- `AskUserQuestion` → `AskUserQuestion`
