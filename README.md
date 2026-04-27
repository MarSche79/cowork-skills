# 🧠 Cowork Skills Collection

A curated set of custom skills for **Microsoft 365 Copilot Cowork** — built by a Security Solutions Engineer to boost pre-sales productivity.

> **What are Cowork Skills?** Custom instruction sets (SKILL.md files) that extend Copilot Cowork with specialized workflows. Drop a skill folder into `Documents/Cowork/Skills/` and it becomes available in your Copilot Cowork sessions.

---

## 📋 Skills Overview

| Skill | Category | Description |
|-------|----------|-------------|
| [**braindump**](skills/braindump/) | 🧠 Knowledge | Persistent, topic-organized knowledge capture & retrieval. Ingest content from URLs, PDFs, Word docs, and slides into a personal knowledge base. Query it later by topic and timeframe. |
| [**deal-intelligence-brief**](skills/deal-intelligence-brief/) | 📊 Analysis | Generates structured deal briefings from emails, meetings, Teams chats, and files. Maps stakeholders, flags risks, and recommends next actions for customer interactions. |
| [**demo-prep**](skills/demo-prep/) | ⚡ Productivity | Prepares you for customer demos by aggregating prior communication history, extracting technical requirements, pain points, competitive context, and proposing targeted demo talking points. |
| [**externe-followups**](skills/externe-followups/) | 📬 Productivity | Finds unanswered messages from external customers and partners in Outlook and Teams (last 2–3 weeks). Filters noise (newsletters, system mails) and delivers a prioritized follow-up list. |
| [**poc-planner**](skills/poc-planner/) | 📋 Planning | Builds a complete Proof-of-Concept / Proof-of-Value plan with success criteria, scope, environment prerequisites, milestone timeline, decision gates, and exit memo template. |
| [**pre-call-checklist**](skills/pre-call-checklist/) | 📞 Productivity | Last-mile briefing before customer calls — surfaces last 3 touchpoints, lists open action items (both ways), and highlights fresh product news relevant to the customer. |
| [**security-questionnaire**](skills/security-questionnaire/) | 🛡️ Security | Answers cybersecurity RFI/RFP/CAIQ questionnaires in spreadsheet form using your knowledge base and Microsoft documentation. Cites sources for every answer. |
| [**sentinel-sizing**](skills/sentinel-sizing/) | 💰 Estimation | Estimates Microsoft Sentinel ingestion volume and monthly cost from a customer profile. Outputs sizing tables, pay-as-you-go vs. commitment-tier comparison, and cost optimization tips. |

---

## 🚀 Getting Started

### Installation

1. **Clone or download** this repository
2. **Copy** the skill folders you want from `skills/` into your local Cowork Skills directory:
   ```
   Documents/Cowork/Skills/
   ```
3. **Customize** the SKILL.md files to match your environment:
   - Replace placeholder email addresses and paths
   - Adjust tool mappings if you use different skill names
   - Adapt language preferences (DE/EN) to your region

### Folder Structure

```
Documents/Cowork/Skills/
├── braindump/
│   └── SKILL.md
├── deal-intelligence-brief/
│   └── SKILL.md
├── demo-prep/
│   └── SKILL.md
├── externe-followups/
│   └── SKILL.md
├── poc-planner/
│   └── SKILL.md
├── pre-call-checklist/
│   └── SKILL.md
├── security-questionnaire/
│   └── SKILL.md
└── sentinel-sizing/
    └── SKILL.md
```

Each skill is self-contained in a single `SKILL.md` file — no additional dependencies.

---

## 🎯 Use Cases by Role

| Role | Recommended Skills |
|------|--------------------|
| **Solutions Engineer / SE** | All of them! |
| **Account Executive** | deal-intelligence-brief, pre-call-checklist, externe-followups |
| **Technical Specialist** | sentinel-sizing, poc-planner, security-questionnaire, demo-prep |
| **Anyone in Sales** | braindump, externe-followups, pre-call-checklist |

---

## 🗣️ Language Support

Most skills are **bilingual (German / English)** — they auto-detect the customer's preferred language from prior correspondence and adapt their output accordingly. You can adjust the language logic in each SKILL.md to match your region.

---

## 🤝 Contributing

Have a skill idea or improvement? Feel free to open an issue or submit a PR!

---

## 📄 License

MIT License — use, modify, and share freely.

---

## ⭐ Acknowledgments

Built with ❤️ using [Microsoft 365 Copilot Cowork](https://www.microsoft.com/en-us/microsoft-365/copilot).
