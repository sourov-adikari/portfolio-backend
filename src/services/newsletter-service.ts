import nodemailer from "nodemailer";
import { MongoServerError } from "mongodb";
import { config } from "../config.js";
import { HttpError } from "../middleware/error-handler.js";
import { getDatabase } from "./mongodb-service.js";

export type NewsletterSubscription = { email: string };
export type NewsletterResult = "subscribed" | "already_subscribed" | "pending_confirmation";

type NewsletterStatus = "pending" | "subscribed" | "email_failed";

const collectionName = "newsletter_subscribers";
let indexInitialization: Promise<void> | null = null;

const ensureSubscriberIndex = async () => {
  const database = await getDatabase();
  await database.collection(collectionName).createIndex({ email: 1 }, { unique: true, name: "newsletter_email_unique" });
};

const initializeSubscriberIndex = async (): Promise<void> => {
  indexInitialization ??= ensureSubscriberIndex().catch((error) => {
    indexInitialization = null;
    throw error;
  });
  await indexInitialization;
};

const sendWelcomeEmail = async (email: string): Promise<void> => {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    throw new HttpError(503, "Newsletter email service is unavailable", "NEWSLETTER_EMAIL_UNAVAILABLE");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  await transporter.sendMail({
    from: config.smtp.user,
    to: email,
    subject: "You're subscribed to Sourov Adikari's newsletter",
    text: [
      "Thanks for subscribing to Sourov Adikari's newsletter.",
      "",
      "You'll receive future updates about projects, development, and new releases.",
    ].join("\n"),
    html: [
      "<h2>Thanks for subscribing</h2>",
      "<p>You're now subscribed to Sourov Adikari's newsletter.</p>",
      "<p>You'll receive future updates about projects, development, and new releases.</p>",
    ].join(""),
  });
};

export const subscribeToNewsletter = async ({ email }: NewsletterSubscription): Promise<NewsletterResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    await initializeSubscriberIndex();
  } catch (error) {
    console.error("Newsletter database initialization failed", error);
    throw new HttpError(503, "Newsletter service is unavailable", "NEWSLETTER_DATABASE_UNAVAILABLE");
  }

  const database = await getDatabase().catch((error) => {
    console.error("Newsletter database connection failed", error);
    throw new HttpError(503, "Newsletter service is unavailable", "NEWSLETTER_DATABASE_UNAVAILABLE");
  });
  const subscribers = database.collection<{ email: string; subscribedAt: Date; status: NewsletterStatus }>(collectionName);

  const existingSubscriber = await subscribers.findOne({ email: normalizedEmail }).catch((error) => {
    console.error("Newsletter subscriber lookup failed", error);
    throw new HttpError(503, "Newsletter service is unavailable", "NEWSLETTER_DATABASE_UNAVAILABLE");
  });
  if (existingSubscriber) return "already_subscribed";

  try {
    await subscribers.insertOne({ email: normalizedEmail, subscribedAt: new Date(), status: "pending" });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return "already_subscribed";
    console.error("Newsletter subscriber insert failed", error);
    throw new HttpError(503, "Newsletter service is unavailable", "NEWSLETTER_DATABASE_UNAVAILABLE");
  }

  try {
    await sendWelcomeEmail(normalizedEmail);
  } catch (error) {
    await subscribers.updateOne({ email: normalizedEmail }, { $set: { status: "email_failed" } }).catch((updateError) => {
      console.error("Newsletter subscriber status update failed", updateError);
    });
    if (error instanceof HttpError) throw error;
    console.error("Newsletter email delivery failed", error);
    throw new HttpError(502, "Unable to send subscription email", "NEWSLETTER_EMAIL_DELIVERY_FAILED");
  }

  await subscribers.updateOne({ email: normalizedEmail }, { $set: { status: "subscribed" } }).catch((error) => {
    console.error("Newsletter subscriber status update failed", error);
    throw new HttpError(503, "Newsletter service is unavailable", "NEWSLETTER_DATABASE_UNAVAILABLE");
  });

  return "subscribed";
};
