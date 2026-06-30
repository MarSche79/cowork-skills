---
name: "cowork-security-newsletter"
description: "Generates a quarterly Microsoft Security newsletter for selected customers. Aggregates \"What's New\" across all MS Security products (Sentinel, Defender XDR, Defender for Endpoint, Defender for Identity, Defender for Cloud Apps, Defender for Office 365, Defender for Cloud, Entra, Purview, Exposure Management, Security Copilot, Unified SecOps). Filters by quarter and customer-relevant products, outputs a professional HTML newsletter. Use for \"security newsletter\", \"quarterly update\", \"what's new n"
---

# Quarterly Microsoft Security Newsletter Generator

You generate a professional, customer-facing quarterly newsletter summarizing everything new across Microsoft Security products. The newsletter is designed for external customers — it should be informative, highlight business value, and link to official docs.

## Step 1: Gather Parameters

Ask the user (or use defaults) for:
1. **Quarter & Year / Time window**: e.g. "Q1 2026" (Jan–Mar), "Q2 2026" (Apr–Jun), or a free-form 3-month window like "last 3 months". Default: the most recently completed quarter based on today's date.
2. **Customer name** (optional): Used for the greeting and header personalization.
3. **Product filter** (optional): Which products to include. Default: ALL. Options:
   - Sentinel
   - Defender XDR (includes unified SecOps)
   - Defender for Endpoint
   - Defender for Identity
   - Defender for Cloud Apps
   - Defender for Office 365
   - Defender for Cloud (CSPM/CWPP)
   - Microsoft Entra (Identity)
   - **Microsoft Purview (Data Security) — ALWAYS INCLUDED (see Step 2 below)**
   - Security Exposure Management
   - Security Copilot
4. **Output format**: HTML file (default) or DOCX (use the docx skill). Always save to the workspace directory.
5. **Language**: English (default) or German. If German, translate section headings and summaries but keep feature names and links in English.

## Step 2: Fetch Sources

Fetch the following sources using `web_fetch`. For each page, extract content for the target window's months only (e.g., Q1 = January, February, March sections).

### CRITICAL — Mandatory product coverage

The following four product families are **MANDATORY in every newsletter** and must never be omitted, even if the user only says "Defender" or "everything new in security":

1. **Microsoft Defender** (XDR + all Defender-for-X workloads the customer uses)
2. **Microsoft Sentinel** (if the customer uses Sentinel — default include)
3. **Microsoft Entra** (Identity — default include)
4. **Microsoft Purview — Data Security** (ALWAYS — see dedicated guidance below)

If the user explicitly excludes one of these, confirm once before omitting. Defender alone is not enough — modern security newsletters must cover the data-security pillar.

### Microsoft Purview / Data Security — ALWAYS INCLUDE

This section is **mandatory in every newsletter**. Even if the user says "Defender", "Microsoft Security", "Sentinel + Defender", or "everything new in security" — you still produce a Data Security section. Only omit it if the user *explicitly and unambiguously* says "no Purview" or "exclude Data Security".

Primary source: https://learn.microsoft.com/en-us/purview/whats-new

The Data Security section should cover all the following sub-areas where there is content in the target window. Use sub-headings (h3) for each sub-area that has updates:

- **Data Security Posture Management (DSPM)** — including DSPM for AI
- **Data Loss Prevention (DLP)** — endpoint DLP, browser/network DLP, cloud-app DLP, JIT protection
- **Sensitivity Labels & Information Protection** — auto-labeling, manual labeling, container labels, OneNote/MP4/Loop support
- **Insider Risk Management (IRM)** — policies, indicators (incl. Fabric/Lakehouse), Triage Agent
- **Data Security Investigations (DSI)** — investigations, AI categorization, personal data examinations, mitigation actions
- **eDiscovery** — review sets, KQL explorer, CMK, sampling
- **Communication Compliance** — if there are updates in the window
- **Compliance Manager / AI compliance** — including Compliance Manager × Azure AI Foundry
- **Agent 365 data security & compliance protections** — when applicable
- **Information Protection scanner** — when applicable
- **Adaptive scopes / Collection policies** — when applicable

Skip empty sub-areas. Curate aggressively — pick the 3–6 most business-impactful items per sub-area, not every minor update.

### "What's New" Documentation Pages (primary structured sources)

| # | Product | URL | Content Structure |
|---|---------|-----|-------------------|
| 1 | Defender XDR | https://learn.microsoft.com/en-us/microsoft-365/security/defender/whats-new | Monthly H2 headers, bullet items with (Preview)/(GA) tags |
| 2 | Unified SecOps Platform | https://learn.microsoft.com/en-us/unified-secops-platform/whats-new | Monthly H2 headers |
| 3 | Microsoft Sentinel | https://learn.microsoft.com/en-us/azure/sentinel/whats-new | Monthly H2 headers with H3 feature names |
| 4 | Defender for Endpoint | https://learn.microsoft.com/en-us/defender-endpoint/whats-new-in-microsoft-defender-endpoint | Monthly H2 headers, table format |
| 5 | Defender for Identity | https://learn.microsoft.com/en-us/defender-for-identity/whats-new | Monthly H3 headers under quarterly sections |
| 6 | Defender for Cloud Apps | https://learn.microsoft.com/en-us/defender-cloud-apps/release-notes | Monthly H2 headers |
| 7 | Defender for Office 365 | https://learn.microsoft.com/en-us/defender-office-365/defender-for-office-365-whats-new | Monthly H2 headers |
| 8 | Defender for Cloud | https://learn.microsoft.com/en-us/azure/defender-for-cloud/release-notes | Monthly H2 headers, table + detail sections |
| 9 | Microsoft Entra | https://learn.microsoft.com/en-us/entra/fundamentals/whats-new | Monthly H2 headers, structured entries with Type/Service/Capability |
| 10 | **Microsoft Purview (Data Security) — MANDATORY** | https://learn.microsoft.com/en-us/purview/whats-new | Monthly H2 headers, grouped by solution area |
| 11 | Security Exposure Management | https://learn.microsoft.com/en-us/security-exposure-management/whats-new | Monthly H2 headers |

The Purview page is **long** — frequently exceeds 30 KB. Always paginate with `start_index` (e.g. 0, 18000, 36000) until you have all months in the target window.

### Blog Sources (secondary — for highlights and thought leadership)

| # | Source | URL |
|---|--------|-----|
| 12 | Microsoft Security Blog | https://www.microsoft.com/en-us/security/blog/ |
| 13 | Security Copilot Blog | https://techcommunity.microsoft.com/category/securitycopilot/blog/securitycopilotblog |
| 14 | Microsoft Purview Blog | https://techcommunity.microsoft.com/category/microsoft-security/blog/microsoft-security-blog |

### Fetching Strategy
- Use `web_fetch` with `max_length: 15000` for each "What's New" page; bump to 18000 for the Purview page.
- For pages that truncate, use `start_index` to paginate and get all months in the target window. The Purview page in particular requires 2–3 paginated fetches.
- For blog pages, extract recent post titles/dates/summaries that fall within the window.
- **Parallelize** fetches where possible (batch 4–6 at a time).
- If a fetch fails, note it and continue with other sources — don't block the newsletter. **Exception**: if the Purview fetch fails, retry it. Never silently drop the Data Security section.

## Step 3: Parse & Categorize

For each source, extract:
- **Feature name**: The headline or H3 title
- **Status**: GA, Preview, Upcoming Change, Deprecation, or Update
- **Month**: Which month within the window
- **Summary**: 1-2 sentence description focusing on customer value (not implementation details)
- **Link**: Deep link to the specific section or blog post

Group items by status priority:
1. 🟢 **Generally Available (GA)** — ready to use now
2. 🔵 **Public Preview** — available to try
3. 🟡 **Upcoming Changes** — plan for these
4. 🔴 **Deprecations** — action required

## Step 4: Generate Newsletter

### Newsletter Template Structure

```
HEADER
- "Microsoft Security Quarterly Update — Q[X] [YEAR]" (or "[Month]–[Month] [YEAR]")
- Subhead: "What's New Across Microsoft Defender & Data Security"
- Optional: "Prepared for [Customer Name]"
- Date generated

EXECUTIVE SUMMARY (4-6 bullet points)
- Top changes across ALL products this window
- MUST include at least one Data Security / Purview highlight
- Written in business language, not technical jargon
- Each bullet should answer "why should I care?"

PRODUCT SECTIONS (one per product, skip empty ones — EXCEPT Purview, which is always included)

For each product with updates:

### [Product Icon Emoji] [Product Name]
#### What's New This Window

**Generally Available** (if any)
- Feature Name — 1-2 sentence value summary. [Learn more →](link)

**In Preview** (if any)
- Feature Name — 1-2 sentence value summary. [Learn more →](link)

**Upcoming Changes** (if any)
- Change description and timeline. [Learn more →](link)

**Deprecations** (if any)
- What's being deprecated and by when. Action needed. [Learn more →](link)

For the MANDATORY Microsoft Purview (Data Security) section, use h3 sub-headings for each sub-area (DSPM, DLP, Sensitivity Labels, IRM, DSI, eDiscovery, etc.) instead of GA/Preview groupings, because Purview content is more naturally organized by solution area.

WHY THIS MATTERS FOR [CUSTOMER]
- 3-5 bullets per product section connecting features to the customer's business reality
- For the Purview section, always tie back to data classification, GDPR/DSGVO, AI governance, insider threat

THOUGHT LEADERSHIP SECTION
- 2-3 notable blog posts from the Microsoft Security Blog and the Purview/AI security blogs
- Title, date, one-line summary, link

LOOKING AHEAD
- Roadmap items, announced-but-not-yet-available features
- Include at least one Data Security / Purview forward-looking item

FOOTER
- "Questions? Reach out to your Microsoft Security specialist."
- Link to M365 Roadmap (with Defender + Purview filters): https://www.microsoft.com/microsoft-365/roadmap
- Link to Microsoft Security Blog
- Link to Microsoft Purview What's New
```

### Product Emoji Legend
- 🛡️ Defender XDR & Unified SecOps
- 📡 Microsoft Sentinel
- 💻 Defender for Endpoint
- 🆔 Defender for Identity
- ☁️ Defender for Cloud Apps
- 📧 Defender for Office 365
- 🔒 Defender for Cloud
- 🔑 Microsoft Entra
- 📋 Microsoft Purview (Data Security)
- 🎯 Security Exposure Management
- 🤖 Security Copilot

## Step 5: Output

1. **HTML Newsletter**: Save as `Security_Newsletter_[Window]_[CustomerName].html` (e.g. `Security_Newsletter_Q1_2026_CUSTOMER_NAME.html` or `Security_Newsletter_Feb-Apr_2026_CUSTOMER_NAME.html`) in the customer's project subfolder under the workspace directory (create if needed). Use clean, professional styling:
   - Max-width 820px centered layout
   - Microsoft-blue (#0078D4) accent color
   - Clean sans-serif font (Segoe UI, system fallback)
   - Responsive for email viewing
   - Each section with subtle separator lines
   - Status badges: colored pills for GA (green), Preview (blue), Upcoming (amber), Deprecated (red)
   - The Data Security section should have visual parity with the Defender sections — same heading style, same density, same "Why this matters" framing

2. **Show summary**: After generating, display the newsletter structure and top highlights to the user in the chat. Always explicitly call out that the Data Security section is included and what sub-areas it covers.

3. **Optional DOCX**: If the user asks for DOCX, invoke the `/docx` skill to convert.

## Important Notes
- **Tone**: Professional but approachable. Write for a security-aware IT decision maker, not a developer.
- **Length**: Aim for 3–6 highlights per product section. Don't list every single update — curate the most impactful ones. Data Security is the exception: cover all sub-areas with updates, but still curate within each sub-area.
- **Links**: Always include "Learn more →" links to official documentation.
- **Accuracy**: Only include features you can verify from the fetched sources. Never fabricate feature names or dates.
- **Window scope**: Strictly filter to the months of the target window. Don't mix in content from earlier months unless it's a "still highly relevant" callout in a clearly marked sub-block.
- **Skip empty products**: If a product has no updates for the window, omit it entirely from the newsletter — **except Microsoft Purview / Data Security, which is mandatory**. If the window genuinely has no Purview updates (very unusual), still include the section with a short "no major changes this window, but here are recent items still worth knowing" callout pulling from the previous 1–2 months.
- **Customer relevance**: If the user specified product filters, only include those products. Even then, include Purview unless explicitly excluded.
- **Self-check before delivering**: Before showing the final output, confirm to yourself: (1) Is there a 📋 Microsoft Purview / Data Security section? (2) Does the executive summary mention at least one Data Security highlight? (3) Does the "Looking Ahead" section mention at least one Purview / Data Security item? If any answer is no, fix it before showing the user.


