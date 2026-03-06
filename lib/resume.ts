import { unstable_cache } from "next/cache";
import { analyzeGitHubData } from "@/lib/analyze";
import { generateResume } from "@/lib/generate";
import { collectGitHubData } from "@/lib/github";
import { ResumeResponse } from "@/types/resume";

const RESUME_PIPELINE_VERSION = "resume-v2-2026-03-04";

async function buildResume(username: string): Promise<ResumeResponse> {
  const raw = await collectGitHubData(username);
  const analysis = analyzeGitHubData(raw);
  const resume = await generateResume(raw, analysis);

  return {
    username: raw.username,
    generatedAt: new Date().toISOString(),
    raw,
    analysis,
    resume,
  };
}

const cachedBuildResume = unstable_cache(
  async (username: string) => buildResume(username),
  ["github-resume-generator", RESUME_PIPELINE_VERSION],
  { revalidate: 900 },
);

export async function getResumeData(username: string) {
  if (process.env.NODE_ENV === "development") {
    return buildResume(username);
  }

  return cachedBuildResume(username);
}
