# Development Guide

## Prerequisites

- Node.js 20+ (TypeScript 5.7+)
- GitHub Personal Access Token (for higher API rate limits)

## Setup

```bash
# Install dependencies
npm install

# Create .env.local from the example file
cp .env.example .env.local
# Edit .env.local and add your token
```

## Running Locally

```bash
# Development server (with hot reload)
npm run dev
# Open http://localhost:3000

# Production build
npm run build
npm run start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Architecture

### Core Modules

- **`lib/github.ts`** — GitHub API client with rate-limit handling and error recovery
- **`lib/analyze.ts`** — Resume analysis (language detection, focus area classification, consistency scoring)
- **`lib/generate.ts`** — Markdown & LaTeX resume generation with recruiter-ready formatting
- **`lib/pdf.ts`** — PDF rendering from markdown with table support and proper typography
- **`lib/resume.ts`** — Resume data pipeline orchestration with caching
- **`types/resume.ts`** — Central TypeScript definitions

### API Routes

- **`POST /api/resume`** — Main resume generation endpoint (cached at 15min intervals)
- **`POST /api/resume/pdf`** — PDF export (calls lib/pdf.ts)

### Frontend

- **`app/page.tsx`** — Main page component with tabbed resume preview and copy buttons
- **`app/globals.css`** — Design system: tokens, animations, responsive layout

## Key Features

✨ **AI Signal Engine** — Extracts meaningful signals from GitHub data:
- PR/issue triage across external repos
- Repository adoption (stars/forks as signal)
- Consistency scoring based on 90-day activity
- Language focus detection (Frontend/Backend/Full-stack/Systems)
- Account age and contribution depth

📊 **Recruiter-Ready Output**:
- ATS-friendly Markdown with proper tables
- Professional single-page LaTeX resume
- Beautiful PDF with enhanced typography
- No UX dark patterns — focused on signal

## Testing Changes

### Local Debugging

```bash
# Test with a real GitHub user
curl -X POST http://localhost:3000/api/resume \
  -H "Content-Type: application/json" \
  -d '{"username":"torvalds"}'
```

### Rate Limit Awareness

- **Unauthenticated**: 60 req/hour
- **Authenticated (with token)**: 5,000 req/hour

If you hit limits during development, the API will return `429 RATE_LIMITED` with a `resetAt` timestamp.

## Performance Notes

- GitHub API calls are cached at the route level (15min)
- Language byte counts fetched from top 8 repos only
- Activity data limited to 3 pages × 100 events (best-effort)

## Code Style

- Use TypeScript `const` over `let`
- Prefer named exports for modules
- Keep functions focused (single responsibility)
- Document complex logic with comments
- Use semantic HTML + CSS custom properties

## Making Changes

1. **Always run type check before committing:**
   ```bash
   npm run typecheck
   ```

2. **Run lint before committing:**
   ```bash
   npm run lint
   ```

3. **Test the build locally:**
   ```bash
   npm run build
   ```

4. **Use descriptive commit messages** following conventional commits:
   - `feat: add feature X`
   - `fix: resolve issue with Y`
   - `refactor: improve code clarity in Z`
   - `docs: update README section`

## Deployment

This project is built for Vercel but works on any Node.js 20+ environment:

```bash
npm run build
npm run start
```

Set `GITHUB_TOKEN` as an environment variable in production.
