---
name: sentinel-sizing
description: |
  Estimates Microsoft Sentinel ingestion volume and monthly cost from a
  customer profile (users, endpoints, servers, log sources, retention). Outputs
  a structured sizing table the SE can drop into a proposal, plus a
  pay-as-you-go vs commitment-tier comparison and key cost-optimization tips.
  Use when the user says "size Sentinel for X", "Sentinel cost estimate",
  "Sentinel sizing", "log ingestion estimate", "Sentinel pricing for [customer]".
---

# Sentinel Sizing & Cost Estimator

Produces a defensible Sentinel sizing + cost estimate based on customer
environment inputs. Outputs a markdown table (and optional .xlsx via the
`xlsx` skill).

---

## Inputs to gather (use `AskUserQuestion` if missing)

| # | Question | Default if unknown |
|---|----------|--------------------|
| 1 | Customer / account name | — |
| 2 | Number of **users** (M365 / Entra) | — |
| 3 | Number of **endpoints** (workstations + laptops) | ≈ users × 1.2 |
| 4 | Number of **servers** (Win + Linux, on-prem + cloud) | — |
| 5 | Cloud footprint (Azure / AWS / GCP — subs/accounts) | — |
| 6 | Network appliances feeding logs (FW, proxy, DNS) | — |
| 7 | Critical SaaS sources (Salesforce, GitHub, Okta, etc.) | — |
| 8 | Required **retention** (interactive + total) | 90 days interactive / 2 years total |
| 9 | Region | West Europe |
| 10 | Currency | EUR |

---

## Step 1 — Estimate ingestion (GB/day) per source

Use these baseline ratios (from MS guidance + field experience). All
documented in the output so the SE can defend each number.

| Source | Baseline | Notes |
|--------|----------|-------|
| **Entra ID sign-in + audit** | 0.5 KB/event; ~15 events/user/day | Free tier covers Activity logs |
| **M365 / Office logs (UAL)** | ~5 MB/user/day | OfficeActivity table; **free** in Sentinel |
| **MDE (Defender for Endpoint) advanced hunting** | ~500 MB/endpoint/day | Free for 30 days from MDE; ingest only what you keep |
| **MDO (Defender for Office)** | ~200 KB/user/day | EmailEvents/UrlClickEvents — free tier |
| **MDI** | ~10 MB/DC/day | Identity logs — free tier |
| **Defender for Cloud (alerts only)** | small, <10 MB/sub/day | Free |
| **Azure Activity Log** | ~5 MB/sub/day | **Free** |
| **Azure Diagnostic / Resource logs** | varies wildly — ask for prior LAW estimate | Paid |
| **NSG flow / VNet / WAF logs** | 1–3 GB/100 VMs/day | Paid; common cost driver |
| **Firewall / proxy / DNS** | 100–500 MB/1000 users/day per appliance | Paid |
| **Linux syslog** | ~50 MB/server/day (at INFO) | Paid |
| **Windows Security Events** | 50–500 MB/server/day depending on filter | Use **Common/Minimal** filter, not All |
| **AWS CloudTrail** | ~500 MB/account/day | Paid |
| **GCP Audit** | ~200 MB/project/day | Paid |
| **Custom apps** | ask | — |

> ⚠️ **Always show the formula and ratios used.** Customers will challenge the number.

## Step 2 — Apply free-tier offsets

Subtract from billable totals:

- **M365 E5 / E5 Security** customers: free ingestion of MDE/MDO/MDI/Entra/Azure Activity/M365 logs.
- **Defender for Servers Plan 2**: 500 MB/server/day free Sentinel ingestion (allowance pooled).
- **Microsoft Sentinel benefit for M365 E5**: 5 MB/user/day free for selected data types.

Document each offset applied.

## Step 3 — Calculate billable GB/day

```
billable_gb_day = sum(all sources in GB/day) – free_tier_offsets
billable_gb_month = billable_gb_day × 30.5
```

Round up to next 100 GB/day band when comparing commitment tiers.

## Step 4 — Pricing — show all relevant tiers

Use **current published Azure pricing for the customer's region** — fetch via
`web_fetch` of `https://azure.microsoft.com/en-us/pricing/details/microsoft-sentinel/`
to avoid stale numbers. Do not hardcode prices in this skill — always fetch.

Build this comparison table:

| Tier | Price model | Monthly cost (est.) | Best for |
|------|-------------|---------------------|----------|
| Pay-as-you-go | per-GB | … | < 100 GB/day, variable load |
| 100 GB/day commitment | flat | … | predictable mid-size |
| 200 GB/day commitment | flat | … | … |
| 500 GB/day commitment | flat | … | … |
| 1000 GB/day commitment | flat | … | enterprise |
| 2000 GB/day commitment | flat | … | … |
| 5000 GB/day commitment | flat | … | very large SOC |

Add **Sentinel data lake** option (auxiliary logs, archive tier) for sources
that don't need interactive query — can cut cost by 50–80% on volume sources
like firewall/DNS/NSG.

## Step 5 — Retention cost

- Default: 90 days interactive included
- Beyond 90 days: per-GB-month rate (fetch from same pricing page)
- Suggest **archive tier** for retention > 1 year

## Step 6 — Output (structured markdown)

```markdown
# Sentinel Sizing — <Customer>
*Generated <YYYY-MM-DD> · prices <region> · currency EUR*

## Environment
- Users: ...
- Endpoints: ...
- ...

## Estimated ingestion
| Source | GB/day | Notes |
|--------|--------|-------|
| ... | ... | ... |
| **Total raw** | **X** | |
| Free-tier offsets | -Y | (M365 E5 + DfS P2 allowances) |
| **Billable** | **Z** | |

## Pricing options (current Azure rates)
[table from §4]

## Retention
- 90 days interactive: included
- 1 year archive: € ...
- 2 years archive: € ...

## Cost-optimization recommendations
1. Move firewall/NSG/DNS to **auxiliary logs / data lake** → est. saving €X/month
2. Filter Windows Security Events with Common/Minimal subset
3. Use **basic logs** for high-volume / low-query tables
4. Set up **cost alerts** in the Sentinel cost-control feature
5. Consider **commitment tier upgrade** if billable consistently > tier cap

## Assumptions & caveats
- ...
- Numbers are estimates; first 30 days of POC will validate.
```

## Step 7 — Save and confirm

- Save to a designated output folder as `<customer>-sentinel-sizing-<YYYY-MM-DD>.md`.
- Optionally render an `.xlsx` (via `xlsx` skill) with editable cells for the customer to plug in their own numbers.
- Reply: *"Estimated **<X> GB/day billable**, ~**€<Y>/month** at the recommended <tier> tier. Top saving: <recommendation>. Saved to <path>."*

---

## Quality rules

- **Always fetch live pricing** — never hardcode.
- **Show every assumption.** No magic numbers.
- **Be conservative on free-tier offsets** — undercount rather than overcount.
- **Flag when input is too vague** — if user says "we have lots of servers" → ask for a number.

## Tool mapping

- `web_fetch` → live Azure pricing
- `xlsx` → optional Excel output
- `view` → knowledge base cross-check
- `AskUserQuestion` → input gathering
