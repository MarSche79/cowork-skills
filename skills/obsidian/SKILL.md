---
name: "obsidian"
description: "Read, search, query, and organize the user's personal LLM Wiki in Obsidian. Ingests raw dumps from the Inbox, files them into the right folders, creates new notes from templates, and answers questions from vault content."
---

# /obsidian — Personal LLM Wiki Skill

## Vault Location
The Obsidian vault is at: `C:\Users\<username>\OneDrive\Obsidian\the user`

## Vault Structure
```
00 - Inbox/          ← Raw dumps, screenshots, quick notes (triage zone)
00 - Me/             ← Personal profile, goals, preferences
01 - Customers/      ← Customer folders + Seller folders
  Benedikt Nowotny/  ← Seller folder (contains assigned customer subfolders)
  Nathalie Wiesmüller/
  Vlad Bilc/
  [Customer Name]/   ← Each customer has these wiki pages:
    Account Overview.md
    Security.md
    Data Security.md
    MDC & Sentinel.md
    Tasks.md
    Notes.md
02 - Tech Knowledge/ ← Technical knowledge areas
  Defender XDR/ | Entra/ | MDC/ | Sentinel/ | Agent 365/ | Data Security/ | DEX/ | misc/
03 - Personal Notes/ ← Personal journal, reflections
Templates/           ← Note templates (Customer, Meeting Note, Tech Note)
Home.md              ← Dashboard
```

## How To Execute

### 1. READ / SEARCH the vault
- Use `grep` with path `C:\Users\<username>\OneDrive\Obsidian\the user` to search content across all .md files
- Use `glob` with pattern `**/*.md` to list all notes
- Use `view` to read specific notes
- Parse YAML frontmatter (between `---` delimiters) for metadata: tags, customer name, dates
- When the user asks "what do I know about X?" — search for X across all .md files, read matching notes, and synthesize an answer

### 2. QUERY by customer
- To find all notes for a customer: `grep` for the customer name, or browse `01 - Customers/[Name]/`
- Read all 6 wiki pages for a customer to build a complete picture
- Cross-reference with Tech Knowledge notes if the query spans products

### 3. CREATE new notes
- Use templates from the `Templates/` folder as a base
- Fill in YAML frontmatter (tags, customer, date)
- Place the note in the correct folder based on type:
  - Customer note → `01 - Customers/[Name]/`
  - Tech note → `02 - Tech Knowledge/[Area]/`
  - Personal → `03 - Personal Notes/`
  - Meeting → `01 - Customers/[Name]/` or create a Meetings subfolder
- Use today's date in ISO format (YYYY-MM-DD)

### 4. ORGANIZE the Inbox (most important workflow)
When the user says "process inbox", "organize my dumps", or similar:
1. Read all files in `00 - Inbox/` (excluding README.md)
2. For each file:
   a. Read the content
   b. Determine what it's about (customer? product? personal?)
   c. Identify the right target folder
   d. If it's about a customer: append to the relevant wiki page (Notes.md, Tasks.md, etc.) or create a new dated note
   e. If it's about a product: append to the relevant Tech Knowledge note
   f. If unclear: ask the user
3. After filing, optionally delete or archive the inbox item
4. Report what was filed where

### 5. UPDATE existing notes
- When the user provides new info about a customer or product, find the right note and append/update
- Always add a date header (### YYYY-MM-DD) before new entries in Notes.md files
- Preserve existing content — append, don't overwrite

### 6. DUMP raw content
When the user pastes raw text, chat snippets, or mentions screenshots:
1. If the target is clear (e.g., "this is about Red Bull"), update the relevant customer note directly
2. If unclear, save to `00 - Inbox/` with a timestamped filename: `dump-YYYY-MM-DD-HHMM.md`
3. Tag with best-guess tags in frontmatter

## Response Style
- When reading vault content, summarize concisely — don't dump raw markdown back
- When creating/updating notes, confirm what was done and where
- When searching, show which notes matched and the relevant excerpts
- Always use German customer names as they appear in the folder structure

## Important Notes
- All files are UTF-8 encoded markdown
- YAML frontmatter is required for every note (tags at minimum)
- Use Obsidian wiki-links: [[Note Name]] or [[Folder/Note Name|Display Text]]
- The vault syncs via OneDrive — files are always local


