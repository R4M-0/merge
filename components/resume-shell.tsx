"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ResumeResponse } from "@/types/resume";

type PreviewTab = "markdown" | "latex";

type ResumeShellProps = {
  initialUsername?: string;
  initialResult?: ResumeResponse | null;
  initialError?: string | null;
};

type ApiError = {
  error: string;
  code?: string;
  resetAt?: string;
};

type ThemeMode = "dark" | "light";

const STAR_ME_URL = process.env.NEXT_PUBLIC_STAR_ME_URL || "https://github.com/R4M-0/merge";

function downloadTextFile(name: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconPdf = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9" />
  </svg>
);

const IconArrowUpRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const IconGitHub = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.66.5 12.03c0 5.1 3.3 9.42 7.88 10.95.58.11.79-.25.79-.56 0-.28-.01-1.19-.02-2.16-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.35.97.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.29-5.25-5.74 0-1.27.45-2.31 1.2-3.12-.12-.3-.52-1.5.11-3.12 0 0 .98-.31 3.2 1.19a11.06 11.06 0 0 1 5.82 0c2.21-1.5 3.19-1.19 3.19-1.19.63 1.62.23 2.82.12 3.12.74.81 1.19 1.85 1.19 3.12 0 4.46-2.7 5.44-5.28 5.73.41.36.78 1.08.78 2.19 0 1.58-.01 2.86-.01 3.25 0 .31.2.68.8.56A11.54 11.54 0 0 0 23.5 12.03C23.5 5.66 18.35.5 12 .5Z" />
  </svg>
);

export function ResumeShell({
  initialUsername = "",
  initialResult = null,
  initialError = null,
}: ResumeShellProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [username, setUsername] = useState(initialUsername);
  const [result] = useState<ResumeResponse | null>(initialResult);
  const [error, setError] = useState<string | null>(initialError);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PreviewTab>("markdown");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const canSubmit = username.trim().length > 0 && !isNavigating;

  const statCards = useMemo(
    () =>
      result
        ? [
            { label: "Public Repos", value: result.raw.publicRepos },
            { label: "Merged PRs", value: result.raw.contributionMetrics.pullRequestsMerged },
            { label: "External Repos", value: result.raw.contributionMetrics.externalReposContributed },
            { label: "Activity 90d", value: result.raw.activity.last90Days },
          ]
        : [],
    [result],
  );

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
  }, []);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("merge-theme", nextTheme);
    setTheme(nextTheme);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = username.trim().replace(/^@/, "");
    if (!cleaned) return;

    setError(null);
    startTransition(() => {
      router.push(`/${cleaned}`);
    });
  };

  const exportPdf = async () => {
    if (!result) return;
    setIsPdfLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: result.resume.markdown,
          username: result.username,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as ApiError;
        throw new Error(payload.error || "PDF export failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${result.username}-resume.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF export failed.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const activeContent = result ? (activeTab === "markdown" ? result.resume.markdown : result.resume.latex) : "";

  return (
    <main>
      <div className="bgLayer bgOne" />
      <div className="bgLayer bgTwo" />
      <div className="bgLayer bgThree" />
      <div className="scanline" />
      <div className="gridGlow" />

      <div className="container">
        <section className="card hero revealIn">
          <div className="heroTop">
            <p className="kicker">AI SIGNAL ENGINE</p>
            <div className="heroActions">
              <button className="themeToggle" type="button" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <IconSun /> : <IconMoon />}
              </button>
              <a className="starButton" href={STAR_ME_URL} target="_blank" rel="noreferrer">
                <IconGitHub />
                <span className="starButtonLabel">Star Me</span>
                <span className="starButtonArrow">
                  <IconArrowUpRight />
                </span>
              </a>
              <span className="chip chipGlow">Recruiter Mode</span>
            </div>
          </div>
          <h1>
            <span className="gradientText">Merge Your GitHub into a Resume</span>
            <span className="heroSub">Evidence-first generation with portfolio-grade output.</span>
          </h1>
          <p className="heroDesc">
            Visit any GitHub username route directly or enter one below to generate a polished,
            quantified resume section with Markdown, LaTeX, and PDF exports.
          </p>
          <div className="pillRow">
            <span>Route-based generation</span>
            <span>Contribution quality</span>
            <span>Signal over vanity</span>
          </div>
        </section>

        <section className="card controlPanel revealIn" style={{ animationDelay: "120ms" }}>
          <form className="form" onSubmit={handleSubmit}>
            <label className="fieldShell">
              <span>GitHub username</span>
              <div className="inputWrap">
                <span className="inputIcon">@</span>
                <input
                  type="text"
                  placeholder="e.g. torvalds"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  aria-label="GitHub username"
                />
              </div>
            </label>
            <button className="primary" type="submit" disabled={!canSubmit}>
              {isNavigating ? (
                <>
                  <span className="btnSpinner" />
                  Generating...
                </>
              ) : (
                "Merge & Generate"
              )}
            </button>
          </form>

          {error ? <p className="error">{error}</p> : null}

          {isNavigating ? (
            <div className="loadingShell">
              <div className="loaderRing">
                <div className="loader" />
              </div>
              <div className="loadingText">
                <h3>Resolving profile route and generating resume...</h3>
                <p>Fetching GitHub data and assembling recruiter-ready output.</p>
              </div>
              <div className="skeletonGrid">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="preview revealIn" style={{ animationDelay: "80ms" }}>
              <div className="resumeTop">
                <div>
                  <h2>{result.resume.headline}</h2>
                  <p className="meta">
                    @{result.username} &middot; Generated {new Date(result.generatedAt).toLocaleString("en-US")}
                  </p>
                </div>
                <span className="chip chipAccent">Focus: {result.analysis.focusArea}</span>
              </div>

              <div className="statsGrid">
                {statCards.map((card, index) => {
                  const style: CSSProperties = { animationDelay: `${150 + index * 80}ms` };
                  return (
                    <article key={card.label} className="statCard revealUp" style={style}>
                      <p>{card.label}</p>
                      <h3>{card.value}</h3>
                    </article>
                  );
                })}
              </div>

              <div className="panelGrid">
                <section className="panel revealUp" style={{ animationDelay: "230ms" }}>
                  <h4>Top Language Mix</h4>
                  <ul className="langList">
                    {result.raw.languageDistribution.slice(0, 5).map((lang, i) => {
                      const style: CSSProperties = { animationDelay: `${280 + i * 70}ms` };
                      return (
                        <li key={lang.language} className="revealUp" style={style}>
                          <div>
                            <span>{lang.language}</span>
                            <span>{lang.percentage}%</span>
                          </div>
                          <div className="barTrack">
                            <span style={{ width: `${Math.max(4, lang.percentage)}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="panel revealUp" style={{ animationDelay: "290ms" }}>
                  <h4>High-Signal Repositories</h4>
                  <ul className="repoList">
                    {result.raw.topRepos.slice(0, 3).map((repo, i) => {
                      const style: CSSProperties = { animationDelay: `${320 + i * 80}ms` };
                      return (
                        <li key={repo.fullName} className="revealUp" style={style}>
                          <a href={repo.htmlUrl} target="_blank" rel="noreferrer">
                            {repo.fullName}
                          </a>
                          <p>
                            {repo.stars} stars &middot; {repo.forks} forks &middot; updated{" "}
                            {new Date(repo.updatedAt).toLocaleDateString("en-US")}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>

              <div className="exportRow revealUp" style={{ animationDelay: "380ms" }}>
                <button
                  className="secondary"
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      `${result.username}-resume.md`,
                      result.resume.markdown,
                      "text/markdown;charset=utf-8",
                    )
                  }
                >
                  <IconDownload />
                  Download .md
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      `${result.username}-resume.tex`,
                      result.resume.latex,
                      "application/x-tex;charset=utf-8",
                    )
                  }
                >
                  <IconDownload />
                  Download .tex
                </button>
                <button className="secondary pdfBtn" type="button" onClick={exportPdf} disabled={isPdfLoading}>
                  {isPdfLoading ? (
                    <>
                      <span className="btnSpinner" />
                      Rendering...
                    </>
                  ) : (
                    <>
                      <IconPdf />
                      Download PDF
                    </>
                  )}
                </button>
              </div>

              <section className="terminal revealUp" style={{ animationDelay: "420ms" }}>
                <header>
                  <div className="termDots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <nav className="tabBar" role="tablist">
                    <button
                      role="tab"
                      aria-selected={activeTab === "markdown"}
                      className={`tabBtn ${activeTab === "markdown" ? "tabActive" : ""}`}
                      onClick={() => setActiveTab("markdown")}
                    >
                      resume.md
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeTab === "latex"}
                      className={`tabBtn ${activeTab === "latex" ? "tabActive" : ""}`}
                      onClick={() => setActiveTab("latex")}
                    >
                      resume.tex
                    </button>
                  </nav>

                  <button
                    className="copyBtn"
                    type="button"
                    title={`Copy ${activeTab === "markdown" ? ".md" : ".tex"}`}
                    onClick={() => copyToClipboard(activeContent, activeTab)}
                  >
                    {copiedId === activeTab ? (
                      <>
                        <IconCheck />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <IconCopy />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </header>
                <pre>{activeContent}</pre>
              </section>
            </div>
          ) : null}
        </section>

        <footer className="footer revealIn" style={{ animationDelay: "500ms" }}>
          <p>Built with Next.js &middot; Powered by the GitHub REST API &middot; Resumes are generated from public data only.</p>
        </footer>
      </div>
    </main>
  );
}
