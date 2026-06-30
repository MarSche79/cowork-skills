---
name: "cowork-braindump"
description: "Persistent personal knowledge base. Ingests URLs, PDFs, Word/PowerPoint docs into topic-organized markdown notes; later queries them on demand. Use for \"braindump this\", \"remember this\", \"save for later\", \"what's new in [topic]\", \"what do I know about [topic]\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\braindump\SKILL.md`

Use the `view` tool to read it, then execute its workflow. Storage path mapping:
- Original: `/mnt/user-config/braindump/`
- Local equivalent: `C:\Users\<username>\Documents\\Cowork\braindump\`
  (create the folder + index.md + sources/ingest-log.md on first use if missing)

Tool mapping:
- `web_fetch` → `web_fetch` tool (available)
- `Read` for PDFs → use a PDF reader; if unavailable, ask user to paste content
- `docx`/`pptx`/`xlsx` skills → invoke via `skill` tool
- `ReadFileContent` for SharePoint/OneDrive → `m365_download_file` after `m365_search_files`
- `AskUserQuestion` → `m_ask_user`


