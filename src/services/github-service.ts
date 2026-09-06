import { config } from "../config.js";

export type GithubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

export const fetchPublicRepositories = async (): Promise<GithubRepository[]> => {
  if (!config.githubUsername) throw new Error("GitHub username is not configured");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken}`;

  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(config.githubUsername)}/repos?type=public&sort=updated&per_page=100`, { headers });
  if (!response.ok) throw new Error(`GitHub API responded with ${response.status}`);
  return (await response.json()) as GithubRepository[];
};