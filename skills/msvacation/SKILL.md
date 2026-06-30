---
name: "msvacation"
description: "Automate Microsoft internal vacation and time-off requests in MS Vacation, and check vacation balances. Triggers: 'create vacation request', 'submit vacation request', 'request time off', 'book vacation', 'report time off', 'vacation balance', 'remaining vacation days', 'msvacation'."
---

# MS Vacation Skill

Automate Microsoft internal time-off requests in MS Vacation at https://aka.ms/msvacation (redirects to https://msvacation.microsoft.com/).

## Overview

This skill helps create Microsoft internal vacation/time-off requests by collecting the desired dates and request type, validating calendar conflicts and public holidays, then using browser automation to fill the MS Vacation request form. It can also answer questions about the user's current vacation balance by reading the **Balance status** page.

MS Vacation is a legacy framed web app. Use Playwright/browser automation against the named frames and stable element IDs observed below. Do not submit a request until the user has explicitly confirmed the exact request details.

## Safety Rules

- **Never submit without explicit confirmation.** Before clicking the final submit/confirm action, show the user the exact request details and ask for confirmation.
- **Treat time-off details as private.** Do not reveal the user's vacation dates, location, travel plans, or reasons to anyone outside the request workflow. If sending a Teams summary to the user, send it only via `m_send_teams_message` to the user and keep it concise.
- **Prefer creating a review-ready request over guessing.** If the UI state, date calculation, balance, approver, or request type is uncertain, stop before submission and ask the user.
- **Do not invent policy.** Use the request reasons exposed by the MS Vacation UI. If a reason has policy implications (for example sickness certificates or unpaid leave), surface the UI text and ask the user to confirm.
- **Do not use direct HTTP posts.** The app uses ASP.NET WebForms state. Use browser automation only.

## How It Works

## Balance Lookup Workflow

Use this workflow when the user asks for vacation balance, remaining vacation days, allowance, approved days, pending approval, expired days, Employee Volunteer Program balance, compensatory days, or deductible vacation type balances.

### Balance Step 1: Open Balance Status

Navigate to MS Vacation and open the balance page in the `MsVacationBody` frame.

Preferred direct navigation:

```javascript
async (page) => {
  let body = page.frame({ name: 'MsVacationBody' });
  if (!body) {
    await page.goto('https://aka.ms/msvacation');
    await page.waitForTimeout(1500);
    body = page.frame({ name: 'MsVacationBody' });
  }

  await body.goto('https://msvacation.microsoft.com/BalanceStatus/');
  await body.waitForLoadState('domcontentloaded');
}
```

Alternative menu navigation:

```javascript
async (page) => {
  const left = page.frame({ name: 'MsVacationLeft' });
  await left.evaluate(() => {
    window.OpenInBody('/BalanceStatus/', 'Balance Status');
  });
}
```

Observed breadcrumb:

```text
Home Page > Balance status
```

### Balance Step 2: Read the Year and Summary Table

The page shows a period header and a balance table.

Observed period header pattern:

```text
Period from {start date} to {end date}
```

Observed table columns:

| Column | Meaning |
|---|---|
| Group | Vacation balance group |
| Initial allowance | Starting allowance for the period |
| Approved | Days already approved/used |
| Pending approval | Requested days awaiting approval |
| Pending cancellation | Days awaiting cancellation |
| Expired days | Days that expired |
| Remaining days | Days still available |

Observed balance groups include:

| Group | Notes |
|---|---|
| Employee Volunteer Program | Volunteer time balance |
| Compensatory Days | Compensatory time balance |
| Non-deductible Vacation Types | Leave types that do not deduct from vacation balance |
| Deductible Vacation Types | Main deductible vacation balance, usually the key value for paid holidays |

Do not hard-code the user's balance values. Always read the table live from the page.

Example extraction script:

```javascript
async (page) => {
  const body = page.frame({ name: 'MsVacationBody' });
  const result = await body.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    const period = text.match(/Period from .*? to .*?(?= Vacation Year|$)/)?.[0] ?? null;
    const rows = Array.from(document.querySelectorAll('table tr'))
      .map((row) => Array.from(row.cells).map((cell) => cell.innerText.replace(/\s+/g, ' ').trim()))
      .filter((cells) => cells.length > 1);

    const [headers, ...dataRows] = rows;
    return {
      period,
      headers,
      balances: dataRows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])))
    };
  });

  return result;
}
```

### Balance Step 3: Navigate Between Years

Use the page controls when the user asks for a different vacation year.

Observed controls:

| Control | Element ID | Purpose |
|---|---|---|
| Previous Year | `PersonBalance_BalanceDetail_BalanceDetail_Header_PreviousPageButton` | Shows the previous vacation year |
| Next Year | `PersonBalance_BalanceDetail_BalanceDetail_Header_NextPageButton` | Shows the next vacation year |

After clicking a year navigation control, wait for the period header to change and re-read the table.

### Balance Step 4: Expand Group Details When Needed

The summary rows can be expanded for details. Use this when the user asks what makes up a balance, which request types are included, or why a remaining balance is lower than expected.

Observed expand links use `aria-label` values such as:

| aria-label pattern |
|---|
| `Expand Employee Volunteer Program` |
| `Expand Compensatory Days` |
| `Expand Non-deductible Vacation Types` |
| `Expand Deductible Vacation Types` |

Click the relevant expand link, wait for the table to update, then extract the expanded rows. Do not assume the generated IDs are stable; prefer `aria-label` selectors:

```javascript
async (page, groupName) => {
  const body = page.frame({ name: 'MsVacationBody' });
  await body.locator(`a[aria-label="Expand ${groupName}"]`).click();
  await body.waitForLoadState('domcontentloaded');
}
```

### Balance Step 5: Answer the User

When reporting balance in chat, keep it concise and include the period because balances are year-specific.

Recommended response shape:

```text
For {period}, your deductible vacation balance is:
- Initial allowance: {initial}
- Approved: {approved}
- Pending approval: {pending approval}
- Pending cancellation: {pending cancellation}
- Expired days: {expired}
- Remaining days: {remaining}
```

If the user asks broadly "how many vacation days do I have left?", answer with **Remaining days** from **Deductible Vacation Types**, and mention any **Pending approval** days separately because those may reduce available time once approved.

If the balance table is missing, says "No data available", or the year is wrong, say that plainly and provide the MS Vacation link:

```text
I could not read a reliable vacation balance for the requested year. Please review it manually: https://aka.ms/msvacation
```

### Step 0: Collect Request Details

Ask for any missing required details:

1. Start date.
2. End date.
3. Day part for start date: `All day`, `Morning`, or `Afternoon`.
4. Day part for end date: `All day`, `Morning`, or `Afternoon`.
5. Day part for days in between: `All day`, `Morning`, or `Afternoon`.
6. Request reason.
7. Optional comments.

Defaults:

- Request reason defaults to **Paid holidays** when the user says vacation, holiday, PTO, or time off without a special reason.
- Day parts default to **All day** unless the user asks for a half-day request.
- Time zone defaults to the user's MS Vacation profile default if already selected; otherwise use the user's local time zone. For Switzerland/central Europe, the observed UI value is **W. Europe Standard Time** (`(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna`).

### Step 1: Validate Dates and Calendar Context

Use the user's authoritative timezone from the session. Use Python for date calculations when needed.

Before opening MS Vacation:

1. Normalize dates to the format used by MS Vacation: `dd/mm/yyyy`.
2. Confirm the date range is valid and the start date is not after the end date.
3. Use `m365_list_events` for the requested date range to check:
   - existing vacation or out-of-office events,
   - conflicting meetings,
   - tentative/unaccepted events,
   - all-day public holidays or partial-day holidays already on the calendar.
4. If conflicts exist, summarize them to the user and ask whether to continue.
5. If the request appears to cover a public holiday or weekend, warn the user and ask whether the selected range is intentional.

When checking calendar events, follow the general scheduling rules:

- Full-day OOF blocks make that day unavailable for new work scheduling, but they may be expected when creating vacation.
- Partial-day OOF blocks should be surfaced explicitly.
- Tentative and unaccepted meetings require user input before treating the time as available.

### Step 2: Open MS Vacation

Navigate to:

```
https://aka.ms/msvacation
```

Expected redirect:

```
https://msvacation.microsoft.com/
```

Observed page title:

```
MS Vacation - Home Page
```

The application uses frames:

| Frame name | Purpose | Observed URL |
|---|---|---|
| `TopMenu` | Header, profile, help/support links | `/TopMenu.aspx` |
| `MsVacationLeft` | Navigation menu | `/LeftMenu.aspx` |
| `MsVacationBody` | Main workflow body | `/Home.aspx` |
| `MsVacationRight` | Vacation year and public holidays | `/RightMenu.aspx` |

If the browser fails to launch because Edge reports an existing browser session, retry navigation once. If it still fails, tell the user to close the existing automated Edge session or use a fresh browser profile.

### Step 3: Review Public Holidays and Balance

The right frame (`MsVacationRight`) shows:

- Vacation year,
- public holidays,
- previous/next year buttons.

Use it to spot public holidays that may overlap the request. For Switzerland, examples observed in 2026 included `Sechseläuten (afternoon only)`, `Tag der Arbeit`, `Auffahrt`, `Pfingstmontag`, `Nationalfeiertag`, and `X-MAS day / Weihnachten`.

If the user asks for balance validation:

1. In `MsVacationLeft`, open **Balance Status**.
2. Inspect the year and remaining balance.
3. If balance is insufficient or unclear, stop before submission and ask the user.

Useful left-menu routes:

| Menu item | Route opened in body frame |
|---|---|
| New Request | `/Requests/New/` |
| Delete Existing Request | `/Requests/Delete/` |
| Balance Status | `/BalanceStatus/` |
| Vacation Request Details | `/Reporting/RequestDetails/` |
| Calendar Item Settings | `/CalendarItemSettings/` |

### Step 4: Open the New Request Form

Preferred direct navigation:

```javascript
async (page) => {
  const body = page.frame({ name: 'MsVacationBody' });
  await body.goto('https://msvacation.microsoft.com/Requests/New/');
  await body.waitForLoadState('domcontentloaded');
}
```

Alternative menu navigation:

```javascript
async (page) => {
  const left = page.frame({ name: 'MsVacationLeft' });
  await left.evaluate(() => {
    window.OpenInBody('/Requests/New/', 'Create a new vacation request');
  });
}
```

Observed breadcrumb:

```
Home Page > Vacation Requests > New Request > Page 1 of 2
```

Observed section headings:

- `New Request Data`
- `Submitted Requests: 1 Jan 2026 to 31 Dec 2026`

### Step 5: Fill Page 1

Fill the form in the `MsVacationBody` frame.

Observed required controls:

| Field | Element ID | Notes |
|---|---|---|
| From Date | `EditRequest_FromDate` | Text input, observed format `18/05/2026` |
| From day part | `EditRequest_FromDayPartList` | `0=All day`, `1=Morning`, `2=Afternoon` |
| To Date | `EditRequest_ToDate` | Text input, observed format `18/05/2026` |
| To day part | `EditRequest_ToDayPartList` | `0=All day`, `1=Morning`, `2=Afternoon` |
| Days in between | `EditRequest_DaysBetweenPartList` | `0=All day`, `1=Morning`, `2=Afternoon` |
| Request reason | `EditRequest_RequestReasonList` | Required select |
| Time zone | `EditRequest_TimeZoneList` | Required select |
| Comments | `EditRequest_Comments` | Optional, max 255 characters |
| Add | `EditRequest_AddRequestButton` | Adds to `Requests Pending Submission` |
| Reset | `EditRequest_ResetRequestButton` | Clears form values |
| Next | `NextButton` | Goes to page 2 for approval/submission |
| Cancel | `CancelButton` | Cancels transaction |

Observed request reason options include:

| Reason | Observed value |
|---|---:|
| Paid holidays | `253` |
| Accident (More than 3 days of sickness doctor certificate is required, hand in to HR) | `3295` |
| Attendance at Trainings | `266` |
| Compassionate Leave - Immediate close relative per policy (10 days) | `256` |
| Compassionate Leave – other close relative per policy (5 days) | `258` |
| Compensation Deduct Day | `3017` |
| Emergency Family Time-Off | `4643` |
| Employee Volunteer Program time off | `2327` |
| Family Caregiver Leave | `3723` |
| Military Inspection - 1 day | `261` |
| Military Service | `264` |
| Moving the household more than 50 km - 2 days | `260` |
| Moving the household within 50 km - 1 day | `259` |
| Own Wedding - 2 days | `254` |
| Paid maternity leave | `2991` |
| Paternity Leave | `3724` |
| Severe Child’s Sickness Leave – SSI reimbursed | `4649` |
| Sickness (More than 3 days of sickness doctor certificate is required, hand in to HR) | `265` |
| Unpaid personal leave | `3873` |
| Wedding of kids, sisters, parents - 1 day | `255` |

Example fill script:

```javascript
async (page, request) => {
  const body = page.frame({ name: 'MsVacationBody' });

  await body.locator('#EditRequest_FromDate').fill(request.fromDate); // dd/mm/yyyy
  await body.locator('#EditRequest_FromDayPartList').selectOption(request.fromPartValue);
  await body.locator('#EditRequest_ToDate').fill(request.toDate); // dd/mm/yyyy
  await body.locator('#EditRequest_ToDayPartList').selectOption(request.toPartValue);
  await body.locator('#EditRequest_DaysBetweenPartList').selectOption(request.betweenPartValue);
  await body.locator('#EditRequest_RequestReasonList').selectOption(request.reasonValue);
  await body.locator('#EditRequest_TimeZoneList').selectOption(request.timeZoneValue);
  await body.locator('#EditRequest_Comments').fill(request.comments ?? '');
}
```

Day part values:

| Day part | Value |
|---|---:|
| All day | `0` |
| Morning | `1` |
| Afternoon | `2` |

Common time zone values:

| Time zone | Value |
|---|---|
| Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna | `W. Europe Standard Time` |
| Dublin, Edinburgh, Lisbon, London | `GMT Standard Time` |
| Brussels, Copenhagen, Madrid, Paris | `Romance Standard Time` |
| Coordinated Universal Time | `UTC` |
| Pacific Time (US & Canada) | `Pacific Standard Time` |

After filling the page:

1. Click **Add** (`#EditRequest_AddRequestButton`) to add the entry to the pending submission section.
2. Verify the pending request appears with the expected dates, day parts, reason, and comments.
3. Do not click **Next** until the pending request has been verified.

### Step 6: Confirm Before Submission

Before moving to final submission, present the user with a concise confirmation:

```text
MS Vacation request ready:
- From: {from date} ({from day part})
- To: {to date} ({to day part})
- Days in between: {day part}
- Reason: {reason}
- Time zone: {time zone}
- Comments: {comments or "none"}

I will submit this in MS Vacation. Confirm?
```

Use `m_ask_user` with choices:

1. `Submit request`
2. `Leave for review`
3. `Cancel`

Only continue with submission if the user chooses or explicitly says `Submit request`.

### Step 7: Submit Page 2

Click **Next** (`#NextButton`) after confirmation.

Because page 2 can vary by user, region, approver setup, or policy, inspect the resulting page before acting:

```javascript
async (page) => {
  const body = page.frame({ name: 'MsVacationBody' });
  await body.locator('#NextButton').click();
  await body.waitForLoadState('domcontentloaded');

  return await body.evaluate(() => ({
    url: location.href,
    text: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 4000),
    controls: Array.from(document.querySelectorAll('input, select, textarea, button')).map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type'),
      id: el.id,
      name: el.getAttribute('name'),
      value: el.getAttribute('value'),
      text: (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim(),
      title: el.getAttribute('title'),
      aria: el.getAttribute('aria-label')
    }))
  }));
}
```

Look for a final submit/confirm button and any validation messages. If an approver, balance warning, policy message, or validation error is shown, summarize it and ask the user before proceeding.

After clicking the final submit/confirm action:

1. Wait for the completion page or success message.
2. Capture the confirmation text and any request identifier if shown.
3. Verify the request appears under submitted requests or request details for the correct year.

### Step 8: Verify

Verify all of the following:

- The request dates match the user's requested range.
- Day parts are correct.
- Request reason is correct.
- Time zone is correct.
- Comments are correct and not truncated unexpectedly.
- The app shows a success or confirmation message, or the submitted request appears in the submitted/request details list.
- Outlook calendar generation is expected based on the selected time zone and the user's calendar item settings.

If verification fails, do not claim success. Tell the user what was entered, what remains uncertain, and provide the link:

```
https://aka.ms/msvacation
```

### Step 9: Notify

At the end of the skill run, send a Teams message to the user with `m_send_teams_message`.

On success:

```html
✅ MS Vacation request submitted

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>From</td><td>{from date} ({from day part})</td></tr>
<tr><td>To</td><td>{to date} ({to day part})</td></tr>
<tr><td>Reason</td><td>{reason}</td></tr>
<tr><td>Status</td><td>Submitted</td></tr>
</table>

Review in MS Vacation: https://aka.ms/msvacation
```

On review-ready draft:

```html
📝 MS Vacation request prepared for review

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>From</td><td>{from date} ({from day part})</td></tr>
<tr><td>To</td><td>{to date} ({to day part})</td></tr>
<tr><td>Reason</td><td>{reason}</td></tr>
<tr><td>Status</td><td>Waiting for your review</td></tr>
</table>

Continue in MS Vacation: https://aka.ms/msvacation
```

On failure or blocked submission:

```html
⚠️ MS Vacation request needs manual attention

<table>
<tr><th>Issue</th><td>{what went wrong}</td></tr>
<tr><th>Request</th><td>{from date} to {to date}, {reason}</td></tr>
<tr><th>Next step</th><td>Review or complete manually in MS Vacation.</td></tr>
</table>

Open MS Vacation: https://aka.ms/msvacation
```

## Data Sources Summary

| Source | When to use | What it provides |
|---|---|---|
| MS Vacation UI | Always | Request form, request reasons, public holidays, balance status, submitted requests |
| Balance Status page | When user asks for balance | Initial allowance, approved days, pending approval, pending cancellation, expired days, remaining days |
| Outlook Calendar | Before submission | Conflicts, existing OOF, tentative/unaccepted meetings |
| User memory | Optional | Preferred default request reason, time zone, common half-day patterns |
| User confirmation | Always before submit | Final approval to submit the request |

## Common Scenarios

### Full-day vacation

- From day part: `All day`
- To day part: `All day`
- Days in between: `All day`
- Reason: `Paid holidays`

### Morning half-day

- From date and To date are usually the same date.
- From day part: `Morning`
- To day part: `Morning`
- Days in between: `Morning`

### Afternoon half-day

- From date and To date are usually the same date.
- From day part: `Afternoon`
- To day part: `Afternoon`
- Days in between: `Afternoon`

### Multi-day vacation with half-day boundaries

Example: start after lunch Monday and return after morning Friday:

- From day part: `Afternoon`
- To day part: `Morning`
- Days in between: `All day`

Always repeat the interpreted day parts back to the user before submitting.

## Troubleshooting

- **Only empty frame labels are visible:** Inspect named frames with `page.frames()` and target `MsVacationBody`.
- **Left menu links are hidden or not clickable:** Navigate the body frame directly to `/Requests/New/` or invoke `OpenInBody` from the left frame.
- **Telemetry script errors appear:** Ignore failures loading `oneittelemetry.blob.core.windows.net/.../msit.telemetry.extensions.ai.javascript.min.js` unless they block the UI.
- **JavaScript null `setAttribute` errors appear in side frames:** These were observed on load and did not block the new request form.
- **Date fields reject input:** Use `dd/mm/yyyy` and fill text inputs directly instead of using the calendar picker.
- **Final submission controls differ:** Stop, inspect page 2 controls, and ask the user before clicking any destructive or final action.
- **Login or access problem:** Ask the user to authenticate in the browser, then continue from the current frame.


