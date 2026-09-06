import { config } from "../config.js";
import { HttpError } from "../middleware/error-handler.js";

export type NewsletterSubscription = { email: string };
export type NewsletterResult = "subscribed" | "already_subscribed" | "pending_confirmation";

export const subscribeToNewsletter = async ({ email }: NewsletterSubscription): Promise<NewsletterResult> => {
  if (!config.brevo.apiKey || !config.brevo.listId) throw new HttpError(503, "Newsletter service is unavailable");

  const doubleOptIn = config.brevo.doiTemplateId > 0;
  const endpoint = doubleOptIn ? "https://api.brevo.com/v3/contacts/doubleOptinConfirmation" : "https://api.brevo.com/v3/contacts";
  const body = doubleOptIn
    ? { email, includeListIds: [config.brevo.listId], templateId: config.brevo.doiTemplateId, redirectionUrl: `${config.frontendUrl}/?newsletter=confirmed` }
    : { email, listIds: [config.brevo.listId], emailBlacklisted: false, updateEnabled: true };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", "api-key": config.brevo.apiKey },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => undefined)) as { code?: string } | undefined;

  if (response.ok) return doubleOptIn ? "pending_confirmation" : "subscribed";
  if (response.status === 400 && payload?.code === "duplicate_parameter") return "already_subscribed";

  console.error("Newsletter subscription failed", { status: response.status, code: payload?.code });
  throw new HttpError(502, "Unable to subscribe right now");
};
