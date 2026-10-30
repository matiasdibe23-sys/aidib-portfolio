# How to add the next case study

Last updated: 2026-10-30. Owner: Matías. Keep this file short; if a step changes, change it here.

## Where it goes
- Site: `index.html`, inside `<section id="projects">`, one new `<article class="card">` after the existing one.
- Once there are two or more cards, rename the `<h2 id="projects-title">` from "Featured project" to "Projects".
- A case with real depth gets its own page at `/<slug>/index.html` (like `/paper/`), and the card links to it.
- Each case keeps its evidence files in `work/outputs/` (numbers, reports), so every claim on the page can be traced.

## The steps (about 45 minutes)
1. **Collect the facts.** One line each: the problem, what I built or tested, the measured result. Numbers come only from files in `work/outputs/` or a notebook output, never from memory.
2. **Open the Claude Project "AI Internship Workspace".** It already holds my voice, stack and identity kit. Paste: "Write a case study card for <piece>. Three beats: problem, what I did, what came of it. Numbers only from the files I attach. No client names, domains or private queries. Careful words: observed, measured, directional."
3. **Edit and cut.** Card text stays under 80 words. Add the stack tags and, if there is a page, the link.
4. **Add the card** to `index.html` (copy the existing `<article class="card">` as the template).
5. **Check locally.** Open the page, narrow the window to 390 px, confirm no horizontal scroll, every link works.
6. **Public-safety check.** No client names, URLs, credentials or raw exports. No claim that something caused a result.
7. **Push to `main`.** Vercel deploys. Open the live URL in a private window and re-check step 5.
8. **Log it** in the table below.

## The three-beat shape
- **Problem:** who had what pain, in one sentence.
- **What I did:** the method and stack, in two sentences.
- **What came of it:** the measured result, with its limit.

## Case log
| # | Piece | Status | Target date |
|---|---|---|---|
| 1 | Agente Experto 360 (WhatsApp RAG agent) | Live | done |
| 2 | Content Opportunity Scoring (ML capstone, paper already at `/paper/`) | Next | Fri 2026-11-06 |
| 3 | A WhatsApp booking automation built in n8n (anonymized, needs client OK) | Candidate | Dec 2026 |

## Next piece: Content Opportunity Scoring
- **Problem:** content-refresh queues are ordered by guesswork, and a Week-4 score ranked pages below chance.
- **What I did:** a time-forward, client-aware test with a market-adjusted label, bootstrap intervals and deliberate-leak controls.
- **What came of it:** on 19 seen clients a Random Forest scored ROC-AUC 0.704 against 0.633 for a one-line click-momentum rule (+0.071, 95% interval +0.015 to +0.092). On 6 unseen clients the two could not be separated. Directional, decision-support evidence; it does not show that refreshing recovers clicks.
- **Work left:** add the card and the link to `/paper/` (the homepage does not link it yet).

## Reminder
Scheduled push notification: Mon 2026-11-02 and then the 1st of each month at 16:17 (Mexico City), "Add the next case study (see docs/add-a-case-study.md)".
