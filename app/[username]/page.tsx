import { Metadata } from "next";
import { ResumeShell } from "@/components/resume-shell";
import { GitHubApiError } from "@/lib/github";
import { getResumeData } from "@/lib/resume";
import { ResumeResponse } from "@/types/resume";

type UsernamePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: UsernamePageProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `${username} | GitHub Resume Generator`,
    description: `Recruiter-ready resume generated from ${username}'s public GitHub activity.`,
  };
}

export default async function UsernamePage({ params }: UsernamePageProps) {
  const { username } = await params;
  let initialUsername = username;
  let initialError: string | undefined;
  let initialResult: ResumeResponse | undefined;

  try {
    initialResult = await getResumeData(username);
    initialUsername = initialResult.username;
  } catch (error) {
    if (error instanceof GitHubApiError) {
      initialError = error.message;
    } else {
      initialError = "Unexpected server error while generating this resume.";
    }
  }

  return (
    <ResumeShell
      initialUsername={initialUsername}
      initialResult={initialResult}
      initialError={initialError}
    />
  );
}
