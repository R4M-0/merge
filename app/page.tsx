"use client";

import { CSSProperties, FormEvent, useCallback, useMemo, useState } from "react";
import { ResumeResponse } from "@/types/resume";

type ApiError = {
  error: string;
  code?: string;
  resetAt?: string;
};

type PreviewTab = "markdown" | "latex";

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

/* ── Inline SVG icons (no extra deps) ────────────────────────────── */
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

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<PreviewTab>("markdown");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canSubmit = username.trim().length > 0 && !isLoading;

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

  /* ── clipboard helper with "Copied!" flash ────────────────────── */
  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as ApiError;
        const details =
          payload.resetAt && payload.code === "RATE_LIMITED"
            ? ` Retry after ${new Date(payload.resetAt).toLocaleString("en-US")}.`
            : "";
        throw new Error(`${payload.error}${details}`);
      }

      const payload = (await response.json()) as ResumeResponse;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportPdf = async () => {
    if (!result) return;
    setIsPdfLoading(true);

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

  const activeContent = result
    ? activeTab === "markdown"
      ? result.resume.markdown
      : result.resume.latex
    : "";

  return (
    <main>
      <div className="bgLayer bgOne" />
      <div className="bgLayer bgTwo" />
      <div className="bgLayer bgThree" />
      <div className="scanline" />
      <div className="gridGlow" />

      <div className="container">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="card hero revealIn">
          <div className="heroTop">
            <p className="kicker">AI SIGNAL ENGINE</p>
            <span className="chip chipGlow">Recruiter Mode</span>
          </div>
          <h1>
            <span className="gradientText">Merge</span>
            <span className="heroSub">Evidence-first generation with portfolio-grade output.</span>
          </h1>
          <p className="heroDesc">
            Enter a GitHub username and get a polished, quantified resume section with exportable
            Markdown, LaTeX, and PDF artifacts.
          </p>
          <div className="pillRow">
            <span>Live metrics</span>
            <span>Contribution quality</span>
            <span>Signal over vanity</span>
          </div>
        </section>

        {/* ── Control Panel ─────────────────────────────────────── */}
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
              {isLoading ? (
                <>
                  <span className="btnSpinner" />
                  Analyzing...
                </>
              ) : (
                "Generate Resume"
              )}
            </button>
          </form>

          {error ? <p className="error">{error}</p> : null}

          {isLoading ? (
            <div className="loadingShell">
              <div className="loaderRing">
                <div className="loader" />
              </div>
              <div className="loadingText">
                <h3>Crunching repositories, PRs, and activity signals...</h3>
                <p>Building recruiter-ready resume content.</p>
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
              {/* ── Resume header ────────────────────────────────── */}
              <div className="resumeTop">
                <div>
                  <h2>{result.resume.headline}</h2>
                  <p className="meta">
                    @{result.username} &middot; Generated{" "}
                    {new Date(result.generatedAt).toLocaleString("en-US")}
                  </p>
                </div>
                <span className="chip chipAccent">Focus: {result.analysis.focusArea}</span>
              </div>

              {/* ── Stat cards ───────────────────────────────────── */}
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

              {/* ── Two-column panels ────────────────────────────── */}
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

              {/* ── Export row ────────────────────────────────────── */}
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
                <button
                  className="secondary pdfBtn"
                  type="button"
                  onClick={exportPdf}
                  disabled={isPdfLoading}
                >
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

              {/* ── Tabbed preview (Markdown / LaTeX) ────────────── */}
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
                    onClick={() =>
                      copyToClipboard(activeContent, activeTab)
                    }
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

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="footer revealIn" style={{ animationDelay: "500ms" }}>
          <p>
            Built with Next.js &middot; Powered by the GitHub REST API &middot; Resumes are generated from
            public data only.
          </p>
        </footer>
      </div>
    </main>
  );
}
