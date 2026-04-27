---
name: poc-planner
description: |
  Builds a structured Proof-of-Concept / Proof-of-Value plan for a Microsoft
  Security product engagement (Sentinel, Defender XDR, Defender for Cloud,
  Security Copilot, Entra). Produces success criteria, scope, environment
  prerequisites, milestone timeline, decision gates, and an exit memo template.
  Bilingual DE/EN — matches the customer's language.
  Use when the user says "plan a POC", "POV scope for X", "POC for Sentinel",
  "POC plan for [customer]", or similar requests.
---

# POC / POV Planner

Generates a complete, customer-ready POC/POV plan as a structured markdown
deliverable (and optionally a .docx).

---

## Inputs to gather (use `AskUserQuestion` if missing)

1. **Customer / account name**
2. **Product(s) in scope** — Sentinel, Defender XDR, Defender for Cloud, Security Copilot, Entra ID Governance, etc.
3. **Primary use case(s)** — e.g., "replace Splunk", "MDR for endpoints", "AI-assisted SOC triage", "container security on AKS"
4. **Duration** — typical: 4 / 6 / 8 weeks (default 6)
5. **Customer environment** — cloud(s), endpoint count, log volume guess, key SaaS/IaaS in use
6. **Language** — DE or EN (default: ask)
7. **Stakeholders** — economic buyer, technical champion, end-user (analyst), compliance owner

---

## Step 1 — Pull context

Before drafting, enrich the inputs:

- If you have a deal-intelligence-brief skill, run it for the account.
- Search your knowledge base (braindump) for the product topics in scope — pull recent capabilities relevant to the use cases.
- If the customer has had prior demos/calls, summarize what was already shown (via email/chat search).

## Step 2 — Draft the plan

Use this exact structure (all sections required):

```markdown
# POC Plan — <Customer> × <Product(s)>

## 1. Executive summary
2–4 sentences: who, what, why, expected outcome.

## 2. Business objectives
- Tied to the customer's stated pain.
- Each objective is measurable (KPI).

## 3. Success criteria
| # | Criterion | Measurement | Target | Owner |
|---|-----------|-------------|--------|-------|
| 1 | ... | ... | ... | Customer / Vendor |

Rule: minimum 3, maximum 7. Each must be binary pass/fail at exit.

## 4. Scope
### In scope
- ...
### Out of scope
- ... (always include — protects both sides)

## 5. Environment & prerequisites
- Tenants / subscriptions required
- Licenses needed (trial SKU + quantity)
- Connectors / data sources to onboard
- Network / firewall asks
- Identity & RBAC roles
- Customer-side prep checklist

## 6. Use cases & test scenarios
For each use case:
- **Scenario name**
- **Steps** (numbered)
- **Expected outcome**
- **Pass/fail mapping** to a success criterion in §3

## 7. Timeline (week-by-week)
| Week | Milestone | Deliverable | Joint meeting |
|------|-----------|-------------|---------------|
| 1 | Kickoff + prereqs | Signed scope doc | Kickoff call |
| 2 | Onboarding + first data flowing | Connector status | Stand-up |
| ... | ... | ... | ... |
| N | Exit review | Exit memo + recommendation | Decision meeting |

## 8. Roles & RACI
| Role | Customer | Vendor (SE) | Partner (if any) |
|------|----------|-------------|-------------------|
| Project lead | R | A | C |
| ... | ... | ... | ... |

## 9. Risks & mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ... | H/M/L | H/M/L | ... |

## 10. Exit decision gates
- Gate 1 (week N/2): "go / no-go" continuation check
- Gate 2 (week N): final decision — purchase, extend POC, or close

## 11. Exit memo template (reusable)
- What we tested
- Results vs success criteria (pass/fail table)
- Customer feedback (verbatim)
- Recommendation (buy / extend / no-fit)
- Next commercial step
```

## Step 3 — Add product-specific defaults

Auto-include realistic defaults the SE shouldn't have to think about:

- **Sentinel POC** → ingest 30 days of pilot logs, 1–2 data connectors, 3 analytics rules, 1 workbook, 1 hunting query, cost estimate via sentinel-sizing skill if available.
- **Defender XDR POC** → MDE onboarding mode (Block/Audit), MDI sensor on 1 DC, MDO policies in evaluation mode.
- **Defender for Cloud POC** → 1 Azure subscription + 1 AWS connector OR 1 GCP connector, CSPM standard, Defender for Servers P2.
- **Security Copilot POC** → 1 SCU minimum, 3 promptbooks, integration with Defender + Sentinel.

## Step 4 — Output

- Save the plan as `<customer>-POC-Plan-<YYYY-MM-DD>.md` in a designated output folder.
- Optionally render to `.docx` via the `docx` skill if the user asks for a Word version.
- Return a chat summary: scope, duration, top 3 success criteria, top 3 risks.

## Step 5 — Confirm

> "POC plan drafted for **<Customer>**. Duration: **<N> weeks**. **<X> success criteria, <Y> use cases, <Z> risks identified.** Saved to `<path>`. Want me to draft the kickoff email or the customer-facing slide deck?"

---

## Quality rules

- **Realistic, not aspirational** — if the customer's environment can't support a 6-week POV, say 8.
- **Always include "Out of scope"** — POC scope creep kills deals.
- **Bilingual:** if the customer language is German, the entire deliverable is German (technical product names stay English).
- **Privacy:** plan is for the SE; customer-shared version omits internal stakeholder names + internal risks.
- **No placeholder fluff** — empty sections get removed, not left as "TBD".

## Tool mapping

- M365 search tools → for context lookup
- `view` / `glob` → braindump search
- `docx` → optional Word export
- `AskUserQuestion` → input gathering
