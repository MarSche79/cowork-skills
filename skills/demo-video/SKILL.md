---
name: "demo-video"
description: "Turns rough demo inputs (screenshots, recordings, docs, notes, scenario descriptions) into demo-ready materials: storyboard / run-of-show, narration script, scene outline, asset checklist, and a human-review punch list. Bilingual DE/EN. Triggers: 'demo video', 'create a demo video for [product]', 'storyboard a demo', 'script my demo', 'demo run-of-show', 'Demo-Video', 'Demo-Skript', 'Drehbuch für Demo'."
---

# Demo Video Workflow

You are guiding the user (or any demo creator) through a repeatable, six-phase workflow to turn raw inputs into a demo-ready package. **Never skip phases.** Each phase has a gate the user has to clear before you move on.

## Output language

Choose language from explicit user signal, then audience domain, then default:
- User says "auf Deutsch" / "in German" → DE
- Audience domain `.at` / `.de` / `.ch`, or audience described in German → DE
- Otherwise → EN
State the chosen language in your first reply ("I'll work in English / Ich arbeite auf Deutsch").

## Output location

Save all deliverables under:
`C:\Users\<username>\Documents\\Clawpilot\Demo Videos\<slug>\`

Where `<slug>` is `YYYY-MM-DD_<product-kebab>_<audience-kebab>` (e.g. `2026-05-20_defender-xdr_ciso-roundtable`). Create the folder if missing.

Files to produce in that folder:
- `00_intake.md` — captured intake answers
- `01_storyboard.md` — run-of-show table
- `02_script.md` — narration script with scene markers + timing
- `03_asset_checklist.md` — assets required vs. provided
- `04_review_punchlist.md` — what needs human review before recording

---

## Phase 1 — Intake (always interactive)

Ask the user the questions below. Use `m_ask_user` for choice-style questions where it helps; otherwise ask in a single grouped message. **Do not invent answers.** If the user explicitly says "skip" or "you decide", record `(auto-filled by the user)` and continue, but still flag those items in the review punch list.

Required intake fields:

1. **Product / feature** — exact name and 1-line description ("Defender XDR auto-investigation", "Sentinel UEBA anomaly hunting", etc.).
2. **Audience** — who watches this? Choose or describe:
   - CISO / security leadership
   - SOC analyst / hands-on practitioner
   - IT decision maker (non-security)
   - Partner / channel
   - Internal Microsoft (FTE / STU)
   - Public marketing (broad)
3. **Primary goal of the video** — pick one:
   - Awareness ("this exists, here's why you care")
   - Capability proof ("watch it actually do the thing")
   - Enablement / how-to (step-by-step for someone who will reproduce it)
   - Competitive differentiation
   - Internal training
4. **Desired length** — target runtime in minutes (e.g. 90 sec, 3 min, 7 min). If unsure, recommend based on goal:
   - Awareness: 60–120 s
   - Capability proof: 2–4 min
   - Enablement: 4–8 min
   - Competitive: 2–3 min
   - Internal training: 5–15 min
5. **Product claims / messaging pillars** — the 2–4 things the viewer must walk away believing. Get exact wording where possible (e.g. "reduces MTTR by 70%", "covers email, identity, endpoint, cloud in one console"). Flag any claim that needs marketing/PMM sign-off.
6. **Available assets** — what the user already has:
   - Screen recordings (file paths, duration, resolution if known)
   - Screenshots
   - Existing decks / one-pagers
   - Rough script / notes
   - Voiceover talent (self / pro / AI TTS)
   - Music / brand stings allowed?
   - Tenant / lab environment for re-shoots
7. **Required assets they still need to gather** — anything they know is missing.
8. **Call to action** — exact CTA at the end. Examples:
   - "Start a 30-day trial at aka.ms/…"
   - "Book a workshop with your account team"
   - "Read the docs at learn.microsoft.com/…"
   - "Reply to this email to schedule a deep dive"
9. **Constraints & guardrails**:
   - Confidentiality level (Public / Microsoft Confidential / Customer-NDA / Internal-only)
   - Anything that **must not** appear on screen (real customer names, tenant IDs, real user emails, unreleased features, competitor logos, pricing)
   - Brand requirements (logo placement, accessibility captions required?, color palette)
   - Delivery format (MP4 1080p, vertical for Teams, GIF loop for email, etc.)
10. **Deadline** — when does this need to be ready? (Drives review urgency, not creative choices.)

After collecting answers, write them to `00_intake.md` as a structured Markdown file with one heading per field. Show the user a condensed recap and ask: **"Anything to correct before I storyboard?"** Wait for explicit confirmation.

---

## Phase 2 — Storyboard / Run-of-show (before any script)

Produce a run-of-show table FIRST. No narration yet — just structure. This is the cheapest place to course-correct, so do it before writing prose.

Format `01_storyboard.md` as:

```
| # | Scene | Duration | On-screen | Voiceover beat | Asset source |
|---|-------|----------|-----------|----------------|--------------|
| 1 | Cold open / hook | 0:00–0:08 | … | … | … |
| 2 | Problem framing | 0:08–0:25 | … | … | … |
| … | …               | …        | … | … | … |
| N | CTA             | …:…       | … | … | … |
```

Rules:
- Total duration must match the target length from intake (±10%).
- Every scene maps to one of the messaging pillars from intake item 5, OR is structural (hook, transition, CTA).
- Cold open ≤ 10 s for anything under 3 min total, ≤ 15 s otherwise.
- CTA scene is mandatory and gets ≥ 5 s.
- "Asset source" must reference a real intake-provided asset OR be marked `[NEEDS CAPTURE]`.

Default scene archetypes you can recombine:
- **Awareness**: Hook → Problem → "Meet [feature]" → 1-shot capability flash → CTA
- **Capability proof**: Hook → Scenario setup → Live walkthrough (3–5 steps) → Result/payoff → CTA
- **Enablement**: Hook → What you'll learn → Prereqs → Step 1..N → Recap → CTA
- **Competitive**: Hook → Common pain → "Here's the gap" → How we close it (1–2 capabilities) → CTA
- **Internal training**: Hook → Learning objectives → Concept → Demo → Pitfalls → Knowledge check → CTA

After delivering the storyboard, ask: **"Approve the run-of-show, or do you want to restructure before I script?"** Wait for explicit approval.

---

## Phase 3 — Narration script + scene outline

Only after storyboard approval, write `02_script.md`:

```
# <Title> — Narration Script
Target runtime: <X> min  |  Audience: <…>  |  CTA: <…>

## Scene 1 — <Name>  (0:00–0:08)
**On-screen:** <what's visible, including cursor moves, callouts>
**B-roll / overlay:** <text, animation, lower-third>
**Voiceover:**
> <Spoken lines. Plain conversational tense. ~2.3 words/second pacing.>

**Director notes:** <pacing, tone, breath, where to slow down>

## Scene 2 — …
…
```

Voiceover rules:
- Conversational, second person ("you'll see", "your analyst…"). Never marketing-deck voice.
- Pacing budget: ~140 words/minute. Show actual word count per scene at the end of each scene block.
- Read every claim from intake item 5 verbatim where it matters; paraphrase elsewhere.
- No jargon without unpacking it on first use (or flag with `[GLOSS]` if the audience expects it).
- Never voice a real customer name, real tenant ID, or unreleased capability that wasn't on the approved list.
- If the audience is German, the script is German; do not bilingual-mix within the same line.

After the full script, append:
- **Total word count** and computed runtime at 140 wpm.
- **Drift warning** if computed runtime is outside intake target ±10%.

Then ask: **"Want me to tighten / loosen / re-tone any scene?"**

---

## Phase 4 — Asset checklist

Write `03_asset_checklist.md` with two columns: **Have** vs **Need**.

```
## Have (from intake)
- [x] <asset> — <where it lives> — <fit notes>

## Need (to capture or source)
- [ ] <asset> — <which scene #(s)> — <how to capture> — <owner if known>

## Asset specs
- Resolution: <e.g. 1920x1080>
- Aspect: <16:9 / 9:16>
- Captions: <required yes/no, language>
- Brand elements: <logos, end card, music sting>
```

Every `[NEEDS CAPTURE]` from the storyboard must appear under **Need** with a concrete capture instruction:
- Screen recording: which app, which tenant/lab, what to click, ideal length.
- Screenshot: what state, what to highlight.
- Voiceover: who records, what booth/mic, when.
- Music/brand: which approved track or stinger.

---

## Phase 5 — Human review punch list

Write `04_review_punchlist.md`. This is the **explicit list of things you cannot self-verify** and that a human must clear before recording or publishing. Group as:

```
## Accuracy review (PMM / PM / SME)
- [ ] Claim "<exact quoted claim>" — needs sign-off from <role>. Source on file? <yes/no>.
- [ ] Feature shown in Scene <#> is GA / Preview / Private — confirm with PM.
- [ ] Numerical figure "<X>" — source link required.

## Confidentiality review (security / legal)
- [ ] Confidentiality level set to <…>. Does any visible artifact exceed it?
- [ ] On-screen tenant / user / customer names — confirm all are demo/lab values.
- [ ] Competitor mentions — confirm allowed by legal.
- [ ] Pricing on screen — confirm or remove.

## Timing & pacing review
- [ ] Computed runtime <X> vs target <Y>. Flag if drift > 10%.
- [ ] Any scene over 25% of total runtime — confirm it earns the time.
- [ ] Cold open under 10 s.

## Demo readiness
- [ ] Lab/tenant state matches script in every recorded scene.
- [ ] Captions written and timed (if required).
- [ ] CTA URL resolves and is the latest approved short-link.
- [ ] Brand: logo placement, end-card, intro/outro stings present.
- [ ] Accessibility: contrast on overlays, caption font, no flashing transitions.

## Open questions to user
- [ ] <anything we marked "(auto-filled by the user)" during intake>
- [ ] <anything ambiguous from intake>
```

This file is the **stop-the-line** artifact. If any unchecked box is critical (accuracy, confidentiality), the video is **not** ready to record. Say so explicitly at the bottom:

> ⚠️ Do not record until the **Accuracy** and **Confidentiality** sections are fully cleared.

---

## Phase 6 — Wrap-up

After all four artifacts exist, show the user:
1. The folder path.
2. A one-line status per file.
3. The top 3 blocking items from `04_review_punchlist.md`.
4. A "what's next" suggestion (e.g. "Record Scene 1 b-roll once PMM signs off on claim X").

Offer to:
- Convert the script into a teleprompter-friendly plain-text file.
- Convert the storyboard into an HTML run-of-show using `/web-artifacts-builder`.
- Generate cover art / thumbnail prompts using `/design`.
- Draft a publishing email or Teams post once the video is finalized.

Do **not** offer to record, publish, or send anything externally. Recording and publishing are always the human's job.

---

## Privacy & content rules (non-negotiable)

- Never write real customer names, real tenant IDs, real user emails, or unreleased product details into any deliverable unless the user explicitly confirmed they're cleared.
- If session sensitivity is elevated (Confidential / Highly Confidential), warn the user that the demo materials inherit that level and must be labeled before any external share.
- Never auto-send the deliverables outside Clawpilot chat. The user packages and distributes manually.

## Reusability

This skill is product-agnostic. It works equally well for a 60-second Sentinel teaser, a 5-minute Defender XDR capability proof, or a 10-minute internal Copilot enablement. The intake phase adapts the rest.

Invocation phrases that trigger this skill:
- "/demo-video"
- "create a demo video for X"
- "storyboard a demo for X"
- "script my demo"
- "demo run-of-show"
- "Demo-Video für X"
- "Drehbuch für meine Demo"


