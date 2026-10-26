# PF08 — Hardening Review ("Break Your Own Site")

**Site:** https://aidib-portfolio.vercel.app/ · **Scope:** `index.html` + `api/contact.mjs` (Vercel function → Resend)
**How it was tested:** automated browser tests (Playwright / headless Chromium) against a local copy of the exact files, with the real `contact.mjs` handler and a mocked Resend API (so no real emails were sent during stress tests). Live-site checks that need a real browser are listed as manual steps at the end.

## 1. Stress-test table

| # | Test | Input / action | Expected | Result |
|---|------|----------------|----------|--------|
| 1 | Empty submit | Click send with all fields empty | Blocked, per-field errors, no request | PASS |
| 2 | Focus handling | Same as above | Focus moves to first invalid field | PASS |
| 3 | Short name | `a` | Blocked (min 2) | PASS |
| 4 | Email without `@` | `nope` | Blocked | PASS |
| 5 | Email without TLD | `a@b` | Blocked | PASS |
| 6 | Email with spaces | `a b@c.com` | Blocked | PASS |
| 7 | Short message | 9 characters | Blocked (min 10) | PASS |
| 8 | Whitespace-only | spaces in every field | Blocked (values are trimmed) | PASS |
| 9 | Valid submit | Padded valid values | 1 email, values trimmed, `reply_to` set, form reset, success message | PASS |
| 10 | **Double submit** | 5 rapid clicks + `requestSubmit()` | Exactly 1 email; button disabled during fetch; re-enabled after | PASS (1 email) |
| 11 | Honeypot | Hidden `website` field filled | 200 returned, **no email sent** | PASS |
| 12 | Honeypot visibility | Field off-screen, `tabindex=-1` | Not visible, skipped by Tab | PASS |
| 13 | Provider failure | Resend returns 500 | Error shown, no false "success", button re-enabled | PASS |
| 14 | Offline | Network disabled mid-submit | "Network error" shown, typed data kept | PASS |
| 15 | HTML/script in fields | `<script>`, `<img onerror>` | Sent as plain text, nothing executes | PASS |
| 16 | Newline in name | `Ana\r\nBcc: x@y.z` (via API) | No line break reaches the email subject | PASS (newline replaced by a space) |
| 17 | Max length | 5000-char message | Accepted | PASS |
| 18 | API: empty body / invalid JSON | direct POST | 400 | PASS |
| 19 | API: 1-char name / 5001-char message | direct POST | 400 | PASS |
| 20 | API: wrong types (arrays/objects) | direct POST | 400 | PASS |
| 21 | API: GET | direct GET | 405 | PASS |
| 22 | API abuse sent emails? | after 18–21 | 0 emails | PASS |
| 23 | Responsive | 320 / 375 / 768 / 1280 px | No horizontal scroll | PASS (4/4) |
| 24 | Internal links | `#projects`, `#contact` | Targets exist | PASS |
| 25 | Keyboard only | Tab through form, Enter | Submits; honeypot skipped | PASS |
| 26 | SEO tags | title, description, canonical, OG, Twitter | All present; exactly one `<h1>`; `lang="en"` | PASS |

**33 / 33 automated checks passed.**

**Browsers:** only Chromium was tested automatically. Firefox, Safari and real mobile devices were **not** tested (see Known Limitations).

**External links (GitHub, LinkedIn, CV):** not verified from this environment (outbound access to the live site was blocked). Verify manually (checklist below).

## 2. Triage

### Fix-Now (fixed in this change)

| Issue found | Before | Fix |
|-------------|--------|-----|
| Weak client validation | Only checked "not empty" and message ≥ 10; any text was accepted as an email (the server rejected it with a generic error) | Name ≥ 2, email regex (`x@y.zz`), message ≥ 10, trimmed values, inline per-field errors with `aria-invalid`, focus on first error |
| Double submit only partly prevented | Button was disabled, but no guard in code | `isSubmitting` guard + disabled button; verified 1 email for 5 rapid clicks |
| Request could hang forever on a bad network | No timeout | 15 s `AbortController` timeout with a clear message |
| Server accepted 1-char names | Client and server rules differed | Server now requires name ≥ 2, matching the client |
| No link preview when sharing | Minimal meta tags | Added title, description (proof statement), canonical, Open Graph (`og:title/description/url/image`), Twitter Card, theme color, and a 1200×630 `og-image.png` |
| Honeypot | Existed | Kept in the payload and verified |

### Known Limitations (not fixed, on purpose)

| Limitation | Why it matters | Mitigation / next step |
|------------|----------------|------------------------|
| **No server-side rate limit** | A script that posts directly to `/api/contact` (skipping the honeypot) can use the whole free quota | Add an IP rate limit (e.g. Vercel KV / Upstash) or a CAPTCHA (Turnstile) if abuse appears |
| **Free-tier quota** (Resend: 100 emails/day, 3,000/month, per Resend's pricing page) | Spam or a traffic spike could block real messages | Monitor in the Resend dashboard; rate limit as above |
| **Resend test sender** (`onboarding@resend.dev`) | Without a verified domain it only delivers to the Resend account's own email, and may land in spam | Verify a domain and set `CONTACT_FROM` |
| Honeypot only stops simple bots | Targeted scripts can ignore it | CAPTCHA if needed |
| Double-submit guard is client-side | A user can still send the same message twice on purpose (no deduplication) | Acceptable for a portfolio |
| Only Chromium auto-tested | Firefox / Safari / real phones may behave differently | Manual check below |
| Google Fonts is an external dependency | If blocked, the page falls back to the system sans-serif (still readable) | Self-host fonts later |
| Contact email is visible in the HTML | Scrapers can harvest it | Remove the mailto fallback if spam appears |
| CV PDF is public and contains phone and email | Anyone can read it | Publish a redacted CV if privacy matters |
| Email mismatch (site vs CV) | Confusing for recruiters | Use one address everywhere |
| Link previews are cached by platforms | Old preview may show after the update | Re-scrape with LinkedIn Post Inspector / Facebook Sharing Debugger |

Not applicable: this site does **not** load Tailwind or any JS framework from a CDN (no JS dependencies at all), so there is no CDN-related risk of that kind.

## 3. Speed / SEO metrics

**Measured (local copy, real files):**

| Metric | Value |
|--------|-------|
| `index.html` size | 13.5 KB (no JS libraries, no images in the page) |
| `og-image.png` size | ~50 KB (only fetched by link-preview crawlers, not by visitors) |
| DOMContentLoaded / load (local, fonts blocked) | ~22 ms / ~24 ms — **not representative of real network conditions** |
| Title length | 55 characters |
| Meta description length | 148 characters |
| `<h1>` count | 1 |

**Not measured yet (needs the live site):** Lighthouse / PageSpeed scores. Run https://pagespeed.web.dev/ on the live URL and fill in:

| Metric (mobile) | Score |
|-----------------|-------|
| Performance | ___ |
| Accessibility | ___ |
| Best Practices | ___ |
| SEO | ___ |
| LCP | ___ |

## 4. Manual checklist on the live site

- [ ] Send a real message; confirm it arrives (check spam).
- [ ] Send 2 quick clicks on "Send message"; confirm only one email arrives.
- [ ] Click GitHub, LinkedIn and CV; confirm all three open correctly.
- [ ] Open the site on a real phone; confirm layout and form.
- [ ] Open in Firefox and Safari; repeat the form test.
- [ ] Paste the URL into LinkedIn Post Inspector; confirm title and image.
- [ ] Fill in the PageSpeed table above.
