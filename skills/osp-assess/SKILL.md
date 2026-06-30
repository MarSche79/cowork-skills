---
name: "osp-assess"
description: "Assess OSP (One Security Program) GTM offerings for a customer. Opens the OSP PowerApps page, reads all recommended GTM offerings, extracts Guide documents (SharePoint-hosted PPTX files), searches M365 for customer context (emails, Teams, calendar), and produces a recommendation table of which programs to activate vs skip with reasoning. Triggers: 'OSP assessment', 'assess OSP', 'evaluate OSP offerings', 'GTM recommendations', 'OSP recommendations'."
---

# OSP Assessment Skill

## Purpose
Assess the usefulness of OSP (One Security Program) GTM offerings for a specific customer account. Read all Guide documents, cross-reference with M365 signals, and produce actionable recommendations.

## Prerequisites
- User must be signed into M365 (check with m_m365_status)
- Browser must be available for PowerApps automation

## Input
The user will provide one of:
- A direct URL to the OSP case in PowerApps
- An account name (e.g., "WIENERBERGER AG") or Case ID (e.g., "4118")
- If no input, ask the user which case to assess

## Step 1: Navigate to OSP and Select Case

### OSP PowerApps URL
The base URL for the OSP Seller View is:
```
https://apps.powerapps.com/play/<YOUR-OSP-APP-URL>?tenantId=<TENANT_ID>&source=portal
```

1. Navigate to the URL using `browser_navigate`
2. Wait for the app to load (wait for "Progress Bar" text to disappear, up to 30 seconds)
3. The landing page shows "Your active cases" with a gallery of cases
4. Each case shows: Account Name, Case ID, Opportunity ID, Date Created, Last Updated
5. Find the target case by matching account name or Case ID
6. Click the ">" button on the matching case to open it

### Page Structure After Loading
- The app loads inside an iframe named "fullscreen-app-host"
- Cases are in a `[role="list"]` gallery with `[role="listitem"]` items
- Each item has a ">" button to navigate to the case detail view

## Step 2: Extract Case Metadata

Once a case is open, capture:
- **Case ID** and **TPID** (from the header bar)
- **Account Name** (from the header bar)
- **Segment** (e.g., "Upper Majors Commercial")
- **Solution Play** (e.g., "Data Security")
- **Compete flags** (e.g., "Crowdstrike, ADFS, Okta")
- **Total # Recommendations** (number of eligible offerings)
- **Your GTM Plan** (number of accepted offerings)
- **OSP Support team** (Case PM, OSP Support person)

## Step 3: Extract All GTM Offerings and Guide URLs

The case detail page shows "Recommended GTM Offerings" in a scrollable gallery at the bottom.

### Column Structure
Columns: Recommended GTM Offerings | Stage | Guide | Response | Info Package | Activation | Activation detail | Status

### How to Extract Offerings
1. The offerings gallery is the last `[role="list"]` in the iframe
2. Each offering is a `[role="listitem"]` element
3. The gallery virtualizes - typically shows 6-7 items at a time
4. You need to scroll the gallery to see all items

### How to Read Offering Names
For each listitem, find div elements with text content. Filter out system text like "Item N", "None", "Add/Edit", "Submit", "Undecided", "Number of items", "Showing", "Selected", "Accepted".

### How to Click Guide Links
Each offering has a Guide icon (chain link). These are rendered as:
- `.powerapps-icon` elements with `cursor: pointer`
- They are SVG-based icons inside the listitem
- Clicking them opens a new browser tab with a SharePoint PPTX URL

Use this code pattern to collect guide URLs:
```javascript
async (page) => {
  const frame = page.frame('fullscreen-app-host');
  const context = page.context();
  const gallery = frame.locator('[role="list"]').last();
  const items = await gallery.locator('[role="listitem"]').all();
  
  for (let i = 0; i < items.length; i++) {
    const guideIcon = items[i].locator('.powerapps-icon').first();
    const [popup] = await Promise.all([
      context.waitForEvent('page', { timeout: 8000 }),
      guideIcon.click()
    ]);
    await popup.waitForLoadState('commit', { timeout: 5000 }).catch(() => {});
    const url = popup.url();
    await popup.close();
    // Store the URL
  }
}
```

### Scrolling the Gallery
To reveal more items:
```javascript
await gallery.evaluate(el => el.scrollTop = el.scrollHeight);
await page.waitForTimeout(2000);
```
Then re-query the items and collect guide URLs for newly visible items.

### Full Collection Strategy
1. Collect offerings + guide URLs for visible items (typically 6)
2. Scroll gallery to bottom
3. Collect offerings + guide URLs for newly visible items
4. Repeat until all items are collected
5. De-duplicate by URL

## Step 4: Read Each Guide Document

Each Guide URL is a SharePoint-hosted PPTX file. **The fastest way to read them is to download them all.**

### Download Approach (Preferred)
SharePoint sharing URLs can be converted to direct download URLs by appending `?download=1`:
```
Original: https://microsoft.sharepoint.com/:p:/s/OneSecurityProgram/Ec2GU95eCTdBrwY558I6pXYBRXqzkZ8ONFunrZzJoR8gSQ?e=ll2gj9
Download: https://microsoft.sharepoint.com/:p:/s/OneSecurityProgram/Ec2GU95eCTdBrwY558I6pXYBRXqzkZ8ONFunrZzJoR8gSQ?download=1
```

Use this Playwright code pattern to batch-download all guides:
```javascript
async (page) => {
  const urls = [ /* array of {name, shareUrl} objects */ ];
  const downloadDir = 'C:\\Users\\<username>\\Documents\\Clawpilot\\Scratchpad\\osp-guides';
  
  for (const item of urls) {
    const downloadUrl = item.shareUrl + '?download=1';
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    page.goto(downloadUrl, { timeout: 15000 }).catch(() => {}); // goto throws because it's a download
    const download = await downloadPromise;
    await download.saveAs(downloadDir + '\\' + item.name + '.pptx');
    await page.waitForTimeout(1000);
  }
}
```

### Text Extraction
After downloading, extract text from all PPTX files using markitdown:
```bash
pip install "markitdown[pptx]" --quiet
# For each file:
python -m markitdown <file>.pptx > <file>.md
```

### What to Extract from Each Guide
- What the offering provides (description, deliverables)
- Eligibility criteria (segments, minimum deal size)
- Key steps to activate
- Timeline / effort required
- Any prerequisites or dependencies

## Step 5: Gather M365 Customer Context

Search for customer-relevant information across M365:

1. **Emails**: Use `m365_search_emails` with:
   - The account/customer name (e.g., "Wienerberger")
   - Key product names from the offerings (e.g., "Defender", "Sentinel", "MDE", "MDI")
   - The solution play area (e.g., "Data Security")
   
2. **Teams**: Use `m365_search_chats` and `m365_list_chat_messages` to find discussions about:
   - The customer account
   - Security solution deployment
   - Compete scenarios (e.g., discussions about Crowdstrike migration)

3. **Calendar**: Use `m365_list_events` to find upcoming meetings related to the customer

4. **WorkIQ**: Use WorkIQ for complex cross-referencing queries like:
   - `workiq.cmd ask -q "What has been discussed about [customer] regarding security, [compete], or [solution play] in the last 3 months?"`

## Step 6: Produce Recommendations

Create a structured assessment table with these columns:

| # | Offering | Stage | Recommendation | Priority | Reasoning |
|---|----------|-------|----------------|----------|-----------|

For each offering, evaluate:

### Recommendation Categories
- **🟢 ACTIVATE** - High value, clear fit for the customer's needs and current stage
- **🟡 CONSIDER** - Potentially valuable but needs more investigation or timing isn't right
- **🔴 SKIP** - Not relevant to this customer's situation or low ROI

### Evaluation Criteria
1. **Alignment with Solution Play**: Does the offering match the solution play (e.g., Data Security)?
2. **Compete Relevance**: Does it help with the compete scenario (e.g., displacing Crowdstrike)?
3. **Stage Appropriateness**: Is the offering designed for the current deal stage?
4. **Customer Readiness**: Based on M365 signals, is the customer ready for this?
5. **Resource Efficiency**: What effort is required vs. expected return?
6. **Complementarity**: Do multiple offerings combine well together?

### Output Format
After the table, provide:
1. **Executive Summary**: 2-3 sentences on the overall recommendation
2. **Top 3 Priority Actions**: The most impactful offerings to activate first
3. **Key Dependencies**: Any offerings that should be activated together
4. **Skip Justification**: Brief explanation for each skipped offering

## Notes
- The OSP app is a PowerApps application that loads in an iframe
- PowerApps galleries virtualize their content - you must scroll to see all items
- Guide links open SharePoint PPTX files in new tabs
- Always close opened tabs after capturing the URL
- The compete flags are important for prioritizing compete-displacement offerings
- Pay attention to the Stage column - it indicates which opportunity stages the offering supports
