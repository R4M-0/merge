<h1 align="center">Merge</h1>

<p align="center">
  GitHub username to recruiter-ready resume generator
</p>

<p align="center">
  <a href="https://github.com/R4M-0/merge">
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js 16" />
  </a>
  <a href="https://github.com/R4M-0/merge">
    <img src="https://img.shields.io/github/stars/R4M-0/merge?style=social" alt="GitHub stars" />
  </a>
</p>

---

## Support the Project

If `Merge` is useful to you and you want to support further development:

`https://buymeacoffee.com/r4m0`

---

## Highlights

- Route-based resume generation via `/<github-username>`
- GitHub REST API ingestion with validation, caching, and rate-limit handling
- Recruiter-focused Markdown, LaTeX, and PDF resume exports
- Signal-first analysis: languages, repository quality, contribution metrics, and activity recency
- Optional AI-enhanced resume writing via OpenRouter
- Production-ready Next.js 16 App Router setup for Vercel deployment
- Animated UI with dark/light theme support and shareable username routes

## Project Structure

```text
merge/
├── app/
│   ├── [username]/page.tsx      # Direct route resume generation
│   ├── api/
│   │   ├── resume/route.ts      # Resume JSON endpoint
│   │   └── resume/pdf/route.ts  # PDF export endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Landing page
├── components/
│   └── resume-shell.tsx         # Shared UI shell
├── lib/
│   ├── analyze.ts               # Signal extraction and focus analysis
│   ├── generate.ts              # Resume generation
│   ├── github.ts                # GitHub API client and metrics collection
│   ├── pdf.ts                   # Markdown to PDF rendering
│   └── resume.ts                # Resume pipeline orchestration + caching
├── types/
│   └── resume.ts                # Shared domain types
├── examples/
│   └── sample-output.md
└── package.json
```

## Requirements

- Node.js 20+
- npm
- GitHub token recommended for higher API rate limits
- OpenRouter API key optional for AI-enhanced writing

## Quick Start

1. Create `.env.local`:


## Quick Start

1. Create `.env.local`:

```env
GITHUB_TOKEN=
OPENROUTER_API_KEY=
NEXT_PUBLIC_STAR_ME_URL=https://github.com/R4M-0/merge
```

2. Install dependencies:

```bash
npm install
```

3. Start development:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

5. Test direct username routes:

```text
http://localhost:3000/R4M-0
```

## Environment Variables

### `GITHUB_TOKEN`

Optional but strongly recommended. Used to avoid low unauthenticated GitHub API rate limits.

Use a fine-grained personal access token with read access to public metadata.

### `OPENROUTER_API_KEY`

Optional. When provided, `Merge` can generate stronger recruiter-style summaries and bullets using an LLM fallback/enhancement path.

If omitted, the app still works using deterministic local generation.

### `NEXT_PUBLIC_STAR_ME_URL`

Optional. Controls the repository link behind the `Star Me` button in the UI.

## Main Features

### Resume Generation

- Enter a GitHub username or visit `/<github-username>`
- Generate recruiter-ready resume content from public GitHub activity
- Export the generated output as Markdown, LaTeX, or PDF

### GitHub Analysis

- Public repositories
- Top repositories ranked by signal
- Language distribution
- Pull requests opened
- Pull requests merged
- Issues opened
- External repository contributions
- Last 30 / 90 day activity windows

### UI / UX

- Animated landing experience
- Light and dark theme support
- Shareable route-based resume pages
- Copy and download actions for generated outputs

### Deployment

- Next.js App Router
- No database required
- Vercel-friendly runtime model
- Server-side caching for generated resumes

## API Endpoints

### `POST /api/resume`

Request:

```json
{ "username": "R4M-0" }
```

Response includes:

- Raw GitHub metrics
- Analysis results
- Generated Markdown
- Generated LaTeX
- Recruiter-focused summary and bullets

### `POST /api/resume/pdf`

Request:

```json
{ "username": "R4M-0", "markdown": "# Resume..." }
```

Returns downloadable PDF bytes with `application/pdf`.

## Error Handling

Handled scenarios:

- Invalid GitHub username format
- User not found
- GitHub API rate limit exceeded
- Empty or low-activity profiles
- PDF generation failure
- Unexpected upstream/API failures

## Local Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run typecheck
```

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Set `GITHUB_TOKEN` and optionally `OPENROUTER_API_KEY`.
4. Deploy.

This project does not require a database or extra server configuration.

