# Verification — 2 November 2026

## Result

All 33 unique companies render with the correct Part 1/Part 2 grouping and their own LinkedIn and careers links. Existing productwithsasi content and branding are retained. No third-party dependency, authentication, backend or build tool was added. Original Downloads source files were left unchanged; this folder is the prepared deployment copy.

## Changes

- Removed duplicated inline company data: `companies.json` now drives rendering directly.
- Extracted JavaScript and CSS into reviewable files.
- Added loading, failed-request, malformed-data and retry behavior, plus a no-JavaScript PDF fallback.
- Added live result counts, semantic headings, company-specific link labels and visible keyboard focus.
- Allowed the narrow-screen navigation to wrap cleanly and increased input/select text to 16px to avoid small-input focus zoom on mobile Safari. Actual iOS Safari behavior was not device-tested.
- Added Vercel's supported static HTML Web Analytics integration and buildless configuration.
- Added Git ignore rules, Vercel upload exclusions, regression tests and deployment instructions.

## Local checks

`node --check app.js` passed. `node --test tests/directory.test.cjs` passed all six tests:

1. 33 unique records, 24/9 split and HTTPS link format.
2. All company names and all 66 rendered link targets, with safe external-tab attributes.
3. Part filters, whitespace/case-insensitive search, combined filters, empty-state recovery, category/description search and AT&T punctuation.
4. Failed fetch followed by successful retry.
5. HTTP errors and malformed data show usable recovery.
6. Bundled PDF, static analytics snippet and no-build Vercel settings.

The functional script is executed in a minimal DOM adapter for regression tests. Browser verification below covers the real layout and native controls.

## Browser verification

Tested in the available in-app browser over a local HTTP server:

- Initial directory: 33 cards, 66 company links.
- Part 2: 9 cards; Part 1: 24 cards.
- `  FRESHWORKS  `: Freshworks; combining it with Part 2: zero results and helpful empty state.
- `bank`: Clayfin, Standard Chartered, HSBC, including description/category matches.
- `AT&T`: exactly AT&T. Clearing search/filter restores all records.
- Viewport widths 320, 375 and 580px: one column; 581, 768 and 850px: two columns; 851, 1120 and 1440px: three columns.
- No horizontal overflow or elements extending beyond the viewport at any tested width.
- Every rendered company link has the expected URL, `_blank` target, `noopener noreferrer` and company-specific accessible name.
- Clicking Download the PDF completed a real download. The downloaded file, original and deployment copy share SHA-256 `3bddb34f5369725f03594507cfc967c2b80b1380e3716d0f5d9ee0f88b9bcd92`.
- PDF inspection: valid PDF 1.4, 7 A4 pages, 198,405 bytes, no encryption or embedded JavaScript.
- No application JavaScript errors were reported in captured browser logs.

Responsive tests use browser viewport emulation; physical-device and cross-browser QA were not performed.

## External links

Every one of the 66 company URLs was checked. Detailed per-URL results are in `link-check.json`.

- All 33 LinkedIn URLs returned HTTP 200 with the expected company titles, including KLA India and NEC Corporation India.
- 29 careers URLs returned HTTP 200 directly.
- Fidelity, Verizon and Tiger Analytics returned HTTP 403 to the automated HTTP client. Each original URL resolved to its official careers page through a separate web check.
- ALTEN India hit a TLS protocol error in the Python HTTP client; the same URL resolved to the official ALTEN India Careers page through a separate web check.
- The four original URLs were retained because the second checks did not establish broken destinations. A successful response is not proof of vacancies or of third-party search parameters being applied.

Secondary evidence: [Fidelity](https://jobs.fidelity.com/in/jobs/?location=Chennai), [Verizon](https://mycareer.verizon.com/jobs/?location=Chennai&pagesize=20), [Tiger Analytics](https://www.tigeranalytics.com/about-us/current-openings/), [ALTEN India](https://www.alten-india.com/careers/).

## Deployment verification remaining

The prepared site is intended for `Sasisampath/Productwithsasi-chennai-tech-companies`. Vercel deployment remains a separate step; follow `README.md` to deploy. Enable Web Analytics in Vercel, deploy/redeploy, then verify real page-view collection on the deployed domain. The local static server cannot supply Vercel's analytics endpoint.
