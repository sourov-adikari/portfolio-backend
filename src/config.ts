import "dotenv/config";

const requiredNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const defaultFrontendUrls = [
  "http://localhost:5173",
  "https://portfolio-sca.vercel.app",
  "https://portfolio-ashen-five-45.vercel.app",
  "https://crispy-disco-7vppggqpjwjfqr6-8080.app.github.dev",
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
  brevo: {
    apiKey: process.env.BREVO_API_KEY ?? "",
    listId: requiredNumber(process.env.BREVO_LIST_ID, 0),
    doiTemplateId: requiredNumber(process.env.BREVO_DOI_TEMPLATE_ID, 0),
  },
  githubUsername: process.env.GITHUB_USERNAME ?? "",
  githubToken: process.env.GITHUB_TOKEN ?? "",
};
