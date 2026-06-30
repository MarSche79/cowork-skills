---
name: "kb"
description: "Shared Knowledge Base for the your security team team. Stores Q&A pairs on SharePoint, searchable by Clawpilot. Supports add, search, list, and manage operations. Use for \"kb add\", \"kb search\", \"add to knowledge base\", \"search KB\", \"what's in the KB about X\", \"list KB topics\", \"KB lookup\"."
---

Load and follow the full skill spec at:
`C:\\Users\\<username>\\Documents\\Cowork\\Skills\\kb\SKILL.md`

Use the `view` tool to read it, then execute its workflow.

Local cache path: `C:\Users\<username>\.copilot\kb\`
SharePoint folder: `https://microsofteur.sharepoint.com/teams/ATSecuritySTU/Shared%20Documents/AI%20Ideation%20Space/Knowledgebase`

Key tool mapping:
- Find KB files on SharePoint: `m365_search_files` with query containing filename
- Download KB files: `m365_download_file`
- Upload existing files: `m365_upload_file` with sharePointUrl
- Upload NEW files: browser file upload to the SharePoint folder
- Search locally: `grep` across `C:\Users\<username>\.copilot\kb\*.md`
- User confirmation: `m_ask_user`


