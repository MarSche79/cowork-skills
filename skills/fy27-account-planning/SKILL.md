---
name: "fy27-account-planning"
description: "Build a personalized FY account-planning site with portfolio view, account details, kanban board, usage & trends, and research panels. Includes shared persistence and Weekly Summary automations."
---

# FY27 Account Planning — Skill Instructions

## Overview
This skill builds a personalized FY account-planning site + automations for the signed-in seller. It resolves all identity and data live from Microsoft systems — nothing is hard-coded. Everything shared persists across browsers via a tiny PHP store.

**Output**: A single-page web app (index.html) with data.php backend, plus two scheduled automations (Weekly Summary, Due-Date Countdown) that DM the user only.

---

## Step 0 — Onboarding Interview

**Do this FIRST.** Resolve identity and choices before pulling any data. Save answers to `planning_config.json` in the working folder.

### 0a. Seller Identity
- Derive alias from Microsoft account: call `m_m365_status` to get the signed-in email (e.g., <your-email@example.com> → jordanp)
- Confirm: "Use alias **jordanp** for MSX/MSXi filters?"
- If unable to derive, ask the user directly
- **Never hard-code another person's alias**

### 0b. Book of Business
Offer to pull assigned accounts from MSX, or ask the user to type the list. For each account capture:
- Display name (e.g., "Acme Corp")
- Key: kebab-case, lowercase (e.g., "acme")
- Tier: Enterprise / Strategic / Commercial
- Sector/industry (e.g., "Financial Services")

Store in `planning_config.json` as `accounts[]`.

### 0c. Team Roster
Ask who can be assigned as kanban card owner (the user + extended team). Capture first names. Default to just the user if skipped. Store as `team_roster[]`.

### 0d. Solution-Area Buckets
Default to: Azure, AI Business Solutions, AI Business Process, Security, Unified. Let the user adjust. Store as `solution_areas[]`.

### 0e. Hosting Target
Ask where the site will live:
- **Azure App Service (Linux + PHP)** — recommended; data.php executes, /home/data persists, true single source of truth
- **Any static host** — localStorage only; persistence is per-browser (be explicit about this)

Capture deploy method (e.g., Kudu VFS, FTPS, `az webapp deploy`, GitHub Actions).

### 0f. Branding
Default to clean, neutral professional theme. Offer optional personalization (accent color, site name, logo). Do NOT reuse anyone else's brand, codenames, or domain.

Save the entire onboarding config to `planning_config.json`:
```json
{
  "alias": "jordanp",
  "accounts": [
    {"key":"acme","name":"Acme Corp","tier":"Enterprise","sector":"Financial Services"}
  ],
  "team_roster": ["Jordan","Alex","Pat"],
  "solution_areas": ["Azure","AI Business Solutions","Security","Unified"],
  "host_type": "app_service",
  "deploy_method": "kudu_vfs",
  "deploy_url": "https://myapp.scm.azurewebsites.net",
  "accent_color": "#0078d4",
  "site_name": "FY27 Planning"
}
```

---

## Step 1 — Pull the Book of Business (Accounts)

Use MSX tooling for the confirmed alias:
- If an MSX account-explorer MCP tool is available, list the seller's assigned accounts (name, TPID, tier, segment)
- Otherwise, navigate MSX in the browser: My Accounts / Territory → read the list
- **Filter by confirmed alias only; never include another seller's territory**

Reconcile with the onboarding list (0b). Update `planning_config.json` with TPID and any missing fields.

---

## Step 2 — Pull FY Revenue (MSXi Billed Pipeline)

**Goal**: Actual revenue landed this FY, split by Field Solution Area, per account.

1. Open MSXi Billed Pipeline (or org's "Actual Revenue by Field Solution Area" report)
2. MSXi reports are slow (20–30s); retry if "Having trouble loading" appears
3. Use Account Name slicer to filter one account at a time
   - Slicer search often needs a real keystroke → fill the text, then Space + Backspace to trigger
   - A plain fill() may not fire the filter
4. Read the Actual Revenue column for each Field Solution Area
5. Map sub-areas to your onboarding buckets:
   - "AI Business Process" + "AI Workforce" → "AI Business Solutions"
   - "Cloud and AI Platform" → "Azure"
   - "Support" → "Unified"
   - "Security" → "Security"
6. **Reconcile** each account's rows to the report's total before trusting
7. Store per-account, per-bucket actuals as `fy_landed.json`:
```json
{
  "acme": { "Azure": 150000, "Security": 50000, "AI Business Solutions": 0 },
  "...": { }
}
```

**Note**: This is *billed* Azure revenue, NOT Azure consumption (ACR). Keep separate.

---

## Step 3 — Pull Azure ACR (Azure Consumption)

**Goal**: 12 months of Azure consumed revenue per account for the trend chart.

1. Open MSXi Azure Consumption / ACR Performance & Outlook report (or MSXi ACR MCP tool)
2. Filter to confirmed alias + current FY
3. Capture month-by-month ACR at account grain
4. Mark the current partial month as "month-to-date" in the UI (not a full month)
5. Reconcile monthly sum to report's account total
6. Store as `acr.json`:
```json
{
  "acme": [
    { "month": 1, "acr": 12500 },
    { "month": 2, "acr": 13200 }
  ]
}
```

(Optional) If Copilot PAU (paid-seat usage) is available from your org's Copilot Usage report, capture 12 months and store as `usage.json`.

---

## Step 4 — Pull Active Agreements & Entitlements (Customer 360)

**Goal**: List each account's active agreements and product/seat entitlements.

Agreement details live in Customer 360 (not Dataverse). Harvest in the browser:

1. Open account record → Customer 360 → General tab → expand Agreements
2. Click (not hover) the count in the Products column to open the entitlements callout
3. Capture agreement id, type (EA/MCA/MACC/Unified), enrollment, renewal/TUP dates, product→seat entitlements
4. Store as `agreements.json`:
```json
{
  "acme": [
    {
      "id": "EA-123456",
      "type": "EA",
      "enrollment": "12345",
      "renewal": "2027-06-30",
      "products": {
        "Microsoft 365 E5": 500,
        "Azure": "Pay-as-you-go",
        "Copilot Pro": 25
      }
    }
  ]
}
```

---

## Step 5 — Build the Site

Generate a single-page app (index.html) using the user's theme. Every view is driven by in-page data objects populated from Steps 1–4.

### 5a. Data Model
```javascript
var ACCT = [...accounts from planning_config];
var USAGE = {...copilot PAU monthly from usage.json};
var ACR = {...azure monthly from acr.json};
var RESEARCH = {...company profiles, subsidiaries, sector trends, stakeholders};
var AGREEMENTS = {...agreements & entitlements from agreements.json};
var LANDED = {...fy_landed from fy_landed.json};
```

### 5b. Portfolio View
One card per managed account. Each card shows:
- Account name + key tier/sector badge
- Open pipeline count (from live MSX, or static count if offline)
- Top open deal (title, value)
- Renewal date (next agreement TUP)
- Health pill: "Thriving" (green) | "Watch" (amber) | "At risk" (red)
- Click to open Account Detail view

Health is editable (see 5c); default is based on pipeline + ACR trend (growing → Thriving; flat → Watch; declining → At risk).

### 5c. Account Detail View
Tabs or sections:
- **Licensing/Agreements** — table of active agreements + product entitlements
- **Pipeline** — list of open MSX opportunities (read-only from Step 1, or link to MSX)
- **Patch Notes** — free-text notes grouped by solution area; editable
- **Kanban Board** — seeded from top opportunities; fully editable

### 5d. Kanban Board
Cards:
```javascript
{
  "id": "p" + timestamp,  // unique
  "title": "Expand Azure Migration",
  "amt": "$250K",
  "owner": "Jordan",      // from team_roster
  "col": "backlog|progress|review|done",
  "due": "2026-07-15",    // optional
  "note": "Free text"     // optional
}
```

**Edit button (✎)** on every card → modal:
- Project (title)
- Value
- Owner (select from team_roster)
- Due date (<input type="date">)
- Notes (<textarea>)

**Due-date countdown chip** on every card:
- < 0 days: "Overdue Nd" (red)
- 0 days: "Due today" (amber)
- 1–7 days: "Due in Nd" (amber)
- > 7 days: "Due Mon D" (muted)
- If note exists, render it inline under the title

**Helper function**:
```javascript
function daysUntil(d){
  if(!d) return null;
  var t = new Date(d + 'T00:00:00');
  if(isNaN(t)) return null;
  var n = new Date();
  n.setHours(0, 0, 0, 0);
  return Math.round((t - n) / 86400000);
}
```

Saving writes the card back to the account's board array and persists it (see 5e).

### 5e. Shared Persistence (Single Source of Truth)
Deploy `data.php` alongside `index.html`. It is a tiny key/value JSON store:
- GET `./data.php` → returns the whole map
- POST `{key, value}` → sets one key (value null deletes)

Persists under `/home/data` on Azure App Service Linux (survives restarts/deploys). State is namespaced per deployment folder.

**Wire the front end** so EVERY edit writes localStorage and POSTs to the store. On load, pull from server first (server wins):

```javascript
var STATE_API = './data.php';

function serverSet(key, raw) {
  try {
    fetch(STATE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({key: key, value: raw})
    }).catch(function(){});
  } catch(e) {}
}

function syncSharedState(done) {
  fetch(STATE_API, {cache: 'no-store'})
    .then(function(r) { return r.ok ? r.json() : {}; })
    .then(function(map) {
      map = map || {};
      // Migrate any local edits the server doesn't have yet (never clobber newer server data)
      for(var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if(k && k.indexOf('patch:') === 0 && !(k in map)) {
          var v = localStorage.getItem(k);
          if(v != null) serverSet(k, v);
        }
      }
      Object.keys(map).forEach(function(k) {
        try { localStorage.setItem(k, map[k]); } catch(e) {}
      });
      if(done) done();
    })
    .catch(function() { if(done) done(); });
}

// Call syncSharedState(...) once on load, after first render
```

**Persisted keys** (raw strings; JSON where noted):
- `patch:board:<acct>` — JSON array of cards
- `patch:notes:<acct>:<area>` — JSON array of {x, at}
- `patch:health:<acct>` — plain string: thriving | watch | atrisk
- `patch:lic:<acct>`, `patch:contacts:<acct>` — JSON

Every setter must compute its string once, write localStorage, and call `serverSet(key, string)`.

**If host is static-only** (no PHP): keep localStorage-only. Tell user persistence is per-browser. Recommend an App Service host for true single-source-of-truth.

### 5f. Usage & Trends Panel
12-month charts:
- **Copilot PAU usage** (optional; leave empty if not available)
- **Azure ACR** (from Step 3)

Both use the account's monthly data. Current partial month is marked "month-to-date".

### 5g. Research & Relationship Map Panel
- Company profile (size, sector, key contact)
- Subsidiaries (if tracked in your system)
- Sector trends (if available; otherwise leave empty)
- Stakeholder heat map: None → Champion (assign per contact; editable)

### 5h. FY Landed-Revenue View
Per-account, per-solution-area buckets. Table or cards showing revenue that has landed. Source: `LANDED` from Step 2.

---

## Step 6 — Deploy

Deploy `index.html` + `data.php` to the user's chosen host:

**Azure App Service (Kudu VFS)**:
```
PUT https://<scm-host>/api/vfs/site/wwwroot/<folder>/<file>
Header: If-Match: *
Body: file content
```

Example:
```
https://myapp.scm.azurewebsites.net/api/vfs/site/wwwroot/index.html
```

**Verify**:
- Live URL returns 200 OK
- Page renders
- If Entra-gated, test from signed-in browser (unauthenticated fetch returns login HTML, not your page)

**BEFORE redeploy onto a live site**:
1. Back up the shared store: GET `./data.php`, save JSON to disk
2. Verify key count is unchanged after deploy
3. Deploy only `index.html` (and `data.php` once at setup)
4. Never overwrite `/home/data` or the state file

---

## Step 7 — Automations (Weekly Summary + Due-Date Countdown)

Create two scheduled automations from bundled templates (see assets/automations/). Substitute:
- User's site URL
- Account key → name map
- Private delivery target (their Teams self-chat or a private channel)

### 7a. Weekly Summary
**Schedule**: Suggested Monday 8:00 AM
- Per-account counts by stage (Backlog, Progress, Review, Done)
- Owners + card list (link to each card)
- Due-date countdowns (Overdue, Due this week)
- Latest patch note per account
- Health status per account
- Rollup: total overdue, due this week, unowned cards

### 7b. Due-Date Countdown
**Schedule**: Suggested any weekday 8:00 AM
- Silent unless a card is overdue or due ≤ 7 days
- Single grouped nudge: "2 overdue, 3 due this week — check your board"
- Link to board

**Both automations are READ-ONLY and DM the user only.**

---

## Privacy & Safety (MUST FOLLOW)

1. **Resolve the signed-in user's identity and use only their territory.** Never hard-code or reuse another person's alias, accounts, figures, team, host, or branding.

2. **All MSX/MSXi/C360 data is the user's private business data.** The automations and site surface it to the user only. Never email or message other people. Never put account figures, pipeline, or schedules into outbound content visible to others.

3. **Before any rebuild/redeploy onto a live site**, back up the shared store and verify zero data loss.

4. **If the site sends or shares anything outward**, require a preview + explicit confirmation first.

---

## Files Generated

After completing all steps, the working folder will contain:
- `planning_config.json` — onboarding config (all steps)
- `fy_landed.json` — FY revenue by account/bucket
- `acr.json` — Azure ACR 12-month data
- `usage.json` — (optional) Copilot PAU 12-month data
- `agreements.json` — agreements & entitlements
- `index.html` — single-page app
- `data.php` — shared state store (deployed with index.html)
- Two automation YAML files (Weekly Summary, Due-Date Countdown)

---

## Quick Start

1. Run the skill: `/fy27-account-planning`
2. Answer onboarding questions (Step 0)
3. The skill will pull data from MSX/MSXi/C360 (Steps 1–4)
4. The skill will generate the site, deploy it, and set up automations (Steps 5–7)
5. Test the live URL; edit a kanban card and verify it persists
6. Share the site URL with team members (if desired); edits sync across browsers via data.php


