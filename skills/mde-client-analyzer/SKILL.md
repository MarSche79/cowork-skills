---
name: "mde-client-analyzer"
description: "Analyze MDE Client Analyzer bundles with Endpoint DLP-focused triage and evidence mapping."
---

Purpose:
Analyze Microsoft Defender for Endpoint (MDE) Client Analyzer outputs, with a primary focus on Endpoint DLP troubleshooting. Produce a source-grounded technical assessment, not guesses.

When to use:
- User asks to analyze MDE Client Analyzer output (.zip or extracted folder)
- User asks specifically about Endpoint DLP issues on Windows endpoints

Inputs expected:
- Path to MDEClientAnalyzerResult.zip OR extracted MDEClientAnalyzerResult folder
- Optional: case context (symptom, affected app/file type, expected policy behavior, timestamps)

Operating procedure:
1) Intake and normalize
- Resolve the user-provided path.
- If input is a zip, extract it to a temp subfolder and locate the analyzer root.
- Detect whether this is Windows analyzer output by checking for common artifacts below.

2) Build artifact manifest (must report what is present vs missing)
Prioritize these files/folders:
- MDEClientAnalyzer.htm
- MDEClientAnalyzer.xml
- SystemInfoLogs\MDEClientAnalyzer.txt
- DefenderAV\GetFilesLog.txt
- DefenderAV\MpSupportFiles.cab (or MPSupportFiles.cab)
- DLP\ (entire folder)
- DLP\dlpPolicy.json / .txt
- DLP\dlpSensitiveInfoTypesPolicy.json / .txt
- DLP\dlpActionsOverridePolicy.* (if present)
- DLP\dlpWebSitesPolicy.* and WebRules_*.json (if present)
- DLP\FileEAs.txt (if present)
- DLP\NoDlp.txt (if present)
- any DLPDiagnose log files moved into DLP\

3) Parse and interpret (DLP-first)
- Read analyzer summary + log text for explicit warnings/errors and collection mode clues.
- Parse DLP JSON artifacts as authoritative policy payload snapshots.
- Extract and list policy names and rule names relevant to observed behavior.
- If SensitiveInfoPolicy-derived XML files (rule_*.xml) exist, summarize rule package IDs and key conditions/actions.
- Parse WebRules_*.json for website rule scope and linkage (including empty WebSiteGroupId cases).
- Parse FileEAs.txt to identify labeling/encryption/EA evidence relevant to endpoint DLP decisions.
- Treat NoDlp.txt as a strong signal that no DLP policy payload was found on that device during collection.

4) Collection-mode and quality checks
Infer likely run mode and quality from evidence:
- DLP trace flow likely used if DLP folder is richly populated and DLPDiagnose outputs exist.
- Quick diagnostic likely used when minimal DLP artifacts exist without broader trace depth.
- Flag incomplete/broken collections (for example missing core analyzer files or truncated DLP evidence).

5) Diagnostic heuristics (explicitly mark as heuristic)
- If NoDlp.txt exists and no policy JSON exists -> likely policy not arrived/applied on endpoint at collection time.
- If dlpPolicy exists but expected rule artifacts are absent -> likely policy mismatch, scope mismatch, or unsupported condition path.
- If GetFilesLog contains access errors (e.g., 0x80070005) -> treat Defender collection as partial and lower confidence for related conclusions.
- If DLP evidence exists but no matching activity context is provided -> request timeline correlation before final root-cause call.

6) Cross-check guidance (cite where relevant)
Ground findings against:
- MDE Analyzer docs: run-analyzer-windows, run-analyzer-linux, run-analyzer-macos
- Live response support log collection doc
- Purview Endpoint DLP docs: getting-started, learn-about, using, configure-endpoint-settings
- Activity Explorer and Defender XDR DeviceFileEvents schema docs

7) Output format
For customer reports, return a detailed report with these sections by default:
A) Executive conclusion (2-5 lines)
B) Evidence table: Artifact | Signal | Interpretation | Confidence
C) Findings (ordered by impact)
D) DLP Policy & Log Deep-Dive Analysis (mandatory for customer reports)
E) Recommended action plan with "why this is important" for each action
F) Official Microsoft Learn links mapped to each recommendation
G) Missing data / what to collect next (exact command/script)

8) Collection commands to suggest when data is insufficient
- Local elevated collection: MDEClientAnalyzer.cmd -t
- Quick DLP check: MDEClientAnalyzer.cmd -q
- Live response helper for DLP scenario: Tools\MDELiveAnalyzerDLP.ps1

Behavior rules:
- Never claim confirmed root cause without at least one direct artifact-backed signal.
- Distinguish facts vs inference vs heuristic in wording.
- If artifacts conflict, explicitly call out the conflict and what additional data resolves it.
- For customer reports: do NOT simplify by default. Provide full technical detail unless the user explicitly requests a C-level/executive summary.
- Keep internal-only comparison/agree-disagree commentary out of customer-facing reports unless explicitly requested.
- Preserve privacy: do not expose unrelated sensitive content from logs; summarize only what is needed for diagnosis.


