import "dotenv/config";

const requiredNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const defaultFrontendUrls = [
  "http://localhost:5173",
  "https://sourovadikari.xyz"
];

const configuredFrontendUrls = (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const frontendUrls = [...new Set([...defaultFrontendUrls, ...configuredFrontendUrls])];

export const config = {
  port: requiredNumber(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  frontendUrls,
  mongodb: {
    uri: process.env.MONGODB_URI ?? "",
    database: process.env.MONGODB_DATABASE ?? "portfolio",
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: requiredNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    secure: process.env.SMTP_SECURE === "true",
  },
  contactEmail: process.env.CONTACT_EMAIL ?? "",
  githubUsername: process.env.GITHUB_USERNAME ?? "",
  githubToken: process.env.GITHUB_TOKEN ?? "",
};
