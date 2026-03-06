# GitHub Username -> Resume Generator

A production-ready Next.js (App Router) web app that converts public GitHub activity into recruiter-focused resume content.

## Features
- Username input with loading, validation, and error states
- GitHub REST API ingestion (no scraping)
- Data analysis for language focus, contribution quality, and activity recency
- AI-Powered recruiter-ready bullet generation and summaries via OpenRouter
- Export options:
  - Markdown (copy + download)
  - LaTeX (download)
  - PDF (server-generated, Vercel-compatible)
- Cache-aware API responses and graceful rate-limit handling

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Node runtime API routes
- `pdf-lib` for server-side PDF generation

## Project Structure

```text
app/
  api/
    resume/route.ts          # Main generation endpoint
    resume/pdf/route.ts      # PDF export endpoint
  globals.css
  layout.tsx
  page.tsx                   # Main UI
lib/
  analyze.ts                 # Insight extraction and focus-area detection
  generate.ts                # Resume bullet and export-text generation
  github.ts                  # GitHub API client + metric collection
  pdf.ts                     # Markdown -> PDF renderer
  resume.ts                  # Pipeline orchestration + caching
types/
  resume.ts                  # Shared domain types
```

## Environment Variables
Create `.env.local`:

```bash
GITHUB_TOKEN=ghp_your_token_here
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key
```

Notes:
- `GITHUB_TOKEN` is optional but strongly recommended for higher rate limits. Use a fine-grained personal access token with read-only public metadata access.
- `OPENROUTER_API_KEY` is optional but highly recommended to power the dynamic AI resume generation (defaults to a static builder if omitted). You can use free models like `google/gemini-2.0-flash-lite-preview-02-05:free`.

## Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## API Endpoints

### `POST /api/resume`
Request:

```json
{ "username": "octocat" }
```

Response includes:
- Raw GitHub metrics
- Analysis output (top languages, focus area, consistency)
- Generated resume artifacts (`markdown`, `latex`, bullets)

### `POST /api/resume/pdf`
Request:

```json
{ "username": "octocat", "markdown": "## ..." }
```

Returns downloadable PDF bytes (`application/pdf`).

## Rate Limits and Errors
Handled cases:
- Invalid username format (`400`)
- Username not found (`404`)
- GitHub rate limit exceeded (`429` + reset time)
- Empty/low-activity profiles (honest neutral phrasing)
- Network/API failures (`5xx`)

## Deployment (Vercel)

1. Push this project to a GitHub repository.
2. Import repository into Vercel.
3. Set `GITHUB_TOKEN` and `OPENROUTER_API_KEY` in Vercel Project Environment Variables.
4. Deploy.
