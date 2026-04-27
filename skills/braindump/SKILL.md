---
name: braindump
description: |
  Persistent knowledge capture and retrieval across sessions. Ingests content from
  URLs (blogs, articles, technical documentation), PDFs, Word documents, PowerPoint
  decks, and other files, then extracts key points into topic-organized markdown
  notes stored in /mnt/user-config/braindump/. Later retrieves and summarizes
  stored knowledge on demand, filtered by topic and optionally by timeframe.
  Use when user asks to "braindump this", "remember this [link/file/article]",
  "save this for later", "add this to my knowledge base", "what's new in [topic]",
  "what do I know about [topic]", "what did I save about [topic]",
  "what's new in Sentinel/Defender/Copilot/etc.", "summarize what I've stored on X",
  "compare updates on X and Y", "what did I save from [source]", or similar
  knowledge-capture and retrieval requests.
  Do NOT use for transient session notes (just answer inline), for searching
  Microsoft 365 content (use SearchM365), or for live web research (use deep-research).
---

# Braindump — Personal Knowledge Base

Persistent, topic-organized knowledge capture. Two modes: **Ingest** and **Query**.

Storage root: `/mnt/user-config/braindump/`

```
/mnt/user-config/braindump/
├── index.md              # topic registry + last-updated dates + entry counts
├── <topic>.md            # one file per topic (e.g., sentinel.md, defender-xdr.md)
└── sources/
    └── ingest-log.md     # chronological log of every ingest with source + topic
```

---

## Detect Mode

Pick the mode from the user's phrasing:

| User says | Mode |
|-----------|------|
| "braindump this", "remember this", "save this", "add to my brain" | **Ingest** |
| "what's new in X", "what do I know about X", "what did I save on X" | **Query** |
| "list topics", "show my braindump", "what have I saved" | **Index** |
| "forget X", "delete topic Y", "remove entry from Z" | **Manage** |

If ambiguous, ask via `AskUserQuestion`.

---

## Mode 1: INGEST

### Step 1 — Acquire content

| Input type | Action |
|------------|--------|
| URL (blog, article, docs) | `web_fetch` the URL |
| PDF | `Read` the file (use `pages:` for large PDFs) |
| .docx | Invoke `docx` skill to extract text |
| .pptx | Invoke `pptx` skill to extract slide text |
| .xlsx | Invoke `xlsx` skill if structured data matters |
| Pasted text | Use directly |
| SharePoint/OneDrive link | Use `ReadFileContent` |

**If fetch fails** (auth wall, 403, paywall): tell the user in plain language and ask them to paste the text or upload the file. Do not fabricate content.

### Step 2 — Extract key points

Produce a structured summary:
- **Title**: clear, specific
- **Date captured**: today (use currentDate from context)
- **Date of source** (if stated in the content)
- **Source**: URL or filename
- **Topic tag(s)**: propose 1–3 short tags (e.g., `sentinel`, `defender-xdr`, `copilot-security`)
- **Key points**: 5–15 bullets covering features, changes, caveats, version numbers, GA/preview status, dates
- **Quotes** (optional): short verbatim quotes if they carry weight
- **Cross-references**: if content relates to existing topics, note them

### Step 3 — Topic routing

1. Read `/mnt/user-config/braindump/index.md` to see existing topics.
2. Propose the best topic tag(s). If a close match exists, use it. If genuinely new, create a new topic file.
3. **Confirm with user** via `AskUserQuestion` ONLY if:
   - Multiple existing topics are equally plausible
   - The content spans 3+ topics and you're unsure how to split
   Otherwise, pick the best tag and proceed — mention the choice in the confirmation.

### Step 4 — Deduplication

Before appending:
- Search the target topic file for the source URL or filename.
- If found: tell the user "Already saved on [date]. Want me to update the entry or skip?" — do not silently overwrite.

### Step 5 — Append entry

Append to `/mnt/user-config/braindump/<topic>.md` using this entry format:

```markdown
## YYYY-MM-DD — <Title>

- **Source**: <URL or filename>
- **Source date**: <YYYY-MM-DD or "unknown">
- **Tags**: `<tag1>`, `<tag2>`

### Key points
- Point 1
- Point 2
- ...

### Notes
<Optional: quotes, caveats, related entries>

---
```

Also append a one-line entry to `sources/ingest-log.md`:
```
YYYY-MM-DD | <topic> | <Title> | <source>
```

### Step 6 — Update index

Update `/mnt/user-config/braindump/index.md`:
- Increment entry count for the topic
- Update `last_updated` date
- Add the topic row if new

### Step 7 — Confirm to user

Plain-language confirmation: "Saved to **[topic]**. Captured N key points." Include 2–3 of the most important points as a preview.

---

## Mode 2: QUERY

Triggered by: "what's new in X", "what do I know about X", "what did I save about X".

### Step 1 — Resolve topic

1. Read `index.md` to list known topics.
2. Match the user's X against topic names and tags (case-insensitive, fuzzy).
3. If no clear match: tell the user what topics exist and ask which they meant.
4. If multiple match (e.g., "security" → sentinel, defender, copilot-security): read all matching topic files.

### Step 2 — Apply time filter

Parse the user's phrasing:
- "what's new" → default to **last 90 days**
- "this month" / "last 30 days" → 30 days
- "this week" → 7 days
- "all" / "everything" / no time words → no filter
- Specific date range → use as stated

Filter entries by their `YYYY-MM-DD` capture date header.

### Step 3 — Synthesize

Structure the response:

**Inline markdown output** (no file unless user asks for a document):

```
## What's new in <Topic> — <timeframe>

**N entries captured.**

### <Title> — <YYYY-MM-DD>
Source: <name/URL>
- Key point 1
- Key point 2

### <Title> — <YYYY-MM-DD>
...
```

Sort newest-first. Group by sub-theme if 5+ entries.

### Step 4 — Cite sources

Every bullet traces to a specific entry. If the user asks for a source, open the topic file and show the exact entry.

### Step 5 — Honest gaps

If a topic has no entries in the time window: say "Nothing new captured on [topic] in the last [window]. You have N older entries — want me to include those?"

If the topic doesn't exist: list the closest existing topics.

---

## Mode 3: INDEX

User asks "list topics", "show my braindump".

Read `index.md`, present as a table:

| Topic | Entries | Last updated |
|-------|---------|--------------|
| sentinel | 12 | 2026-04-15 |
| defender-xdr | 7 | 2026-04-02 |

---

## Mode 4: MANAGE

**Delete a topic**: confirm via `AskUserQuestion` (destructive), then remove the topic file and its index row.
**Delete an entry**: read topic file, identify the entry, use `Edit` to remove it, update index count.
**Rename a topic**: rename file, update all references in `index.md` and `ingest-log.md`.

Always confirm destructive actions before executing.

---

## Quality rules

- **Never fabricate**: every key point must be grounded in the ingested content. If a fact isn't in the source, don't include it.
- **Preserve specifics**: version numbers, GA dates, preview flags, pricing, feature names — capture these verbatim.
- **Neutral tone**: capture what the source says, not your opinion. Flag vendor hype ("marketing claim") when obvious.
- **Language**: match the user's language (DE/EN) in the confirmation; keep stored notes in the source's original language.
- **No duplication**: before appending, check for the same source URL/filename in the topic file.
- **Skill execution**: invoke document skills (`pdf`, `docx`, `pptx`) via the Skill tool when processing those file types.

---

## Example flows

**Ingest:**
> User: "Braindump this: https://techcommunity.microsoft.com/sentinel-whats-new-april"
> 1. web_fetch the URL
> 2. Extract: title, date, 8 key points about new Sentinel features
> 3. Route to `sentinel.md` (existing topic)
> 4. Check for dupes — not found
> 5. Append entry, update index
> 6. Reply: "Saved to **sentinel** — 8 key points captured. Highlights: [preview]."

**Query:**
> User: "What's new in Sentinel?"
> 1. Read `index.md` → topic `sentinel` exists, 12 entries
> 2. Read `sentinel.md`, filter to last 90 days → 5 entries
> 3. Present newest-first with source attribution
