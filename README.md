# Chennai Tech + Product Companies — productwithsasi

A buildless directory of 33 companies: 24 from Part 1 and 9 new in Part 2. The existing typography, colors, cards, wording, branding and bundled PDF are preserved.

## Run locally

From this folder:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in a browser. Use HTTP rather than double-clicking `index.html`: the directory loads `companies.json` with fetch. Python is only a local preview tool, not a deployment dependency.

## Files and editing

- `index.html`: page content, metadata and Vercel Web Analytics snippet.
- `styles.css`: original styles plus narrow-screen and accessibility refinements.
- `app.js`: rendering, search, Part 1/Part 2 filters, loading/error/retry handling.
- `companies.json`: the only source of company records. Edit this file to change company details or links. Preserve the six existing string fields and HTTPS URLs.
- `Chennai_Product_Companies_Part1_Part2_2026.pdf`: original seven-page downloadable guide, unchanged.
- `vercel.json`: framework-free deployment settings; no build step.
- `tests/directory.test.cjs`: dependency-free regression tests.
- `TEST_REPORT.md` and `link-check.json`: verification results from 2 November 2026.

If the company collection changes, update the headline statistics, description and PDF separately. The on-page filtered result count updates automatically.

## Test

With Node.js 20 or later installed, from this folder:

```sh
node --check app.js
node --test tests/directory.test.cjs
```

No `npm install` is needed. See `TEST_REPORT.md` for browser checks and link-check limitations.

## Push to GitHub

1. Create an empty GitHub repository, for example `chennai-tech-companies`. Leave the GitHub options for an initial README, license and gitignore unchecked because this folder already contains project files.
2. Open a terminal in this folder, then run:

```sh
git init -b main
git add .
git commit -m "Prepare productwithsasi Chennai directory for deployment"
git remote add origin https://github.com/Sasisampath/Productwithsasi-chennai-tech-companies.git
git push -u origin main
```

The remote above points to the supplied GitHub repository. Authenticate to GitHub when prompted. Push the contents of this project folder, including the PDF and dotfiles; do not push the enclosing Codex workspace or the ZIP file.

## Deploy to Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import the GitHub repository and grant Vercel access to that repository if prompted.
3. Use these settings (also declared in `vercel.json`):

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Repository root (`./`) |
| Build Command | Override enabled, field empty |
| Output Directory | `.` |
| Install Command | No dependencies to install; leave unset |
| Environment Variables | None |

4. Select **Deploy**. Subsequent pushes to `main` trigger production deployments through the Git integration.
5. Open the deployment and verify the 33-company count, search, both filters, company links and PDF download.

This project has no SPA catch-all rewrite: missing files must remain missing, including the Vercel analytics endpoint during local previews.

Official Vercel instructions: [static build configuration](https://vercel.com/docs/builds/configure-a-build).

## Enable Vercel Web Analytics

The supported no-package static HTML integration is already included:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

In the Vercel project dashboard, open **Analytics** and enable **Web Analytics**, then deploy/redeploy the project. Visit the deployed site with a browser that allows analytics, and check its Network panel for the analytics script and a page-view request. Confirm traffic in the Vercel Analytics dashboard. If Vercel presents a project-specific script path, use the exact static HTML snippet shown in that dashboard.

The `/_vercel/insights/script.js` endpoint is provided by Vercel and remains the SDK's default production path. It is not a local file and may return 404 on Python's local server; that does not affect the directory. No npm package, token, environment variable, backend, authentication or custom event integration is required. This change adds page-view analytics only.

References: [Vercel Analytics quickstart](https://vercel.com/docs/analytics/quickstart), [official SDK default script path](https://github.com/vercel/analytics/blob/main/packages/web/src/utils.ts), [troubleshooting](https://vercel.com/docs/analytics/troubleshooting).

Analytics collection cannot be verified until Web Analytics is enabled on the deployed Vercel project. External careers pages may change independently; the directory does not guarantee vacancies or enforce Chennai-specific filters on third-party sites.
