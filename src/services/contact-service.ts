import nodemailer from "nodemailer";
import { config } from "../config.js";
import { HttpError } from "../middleware/error-handler.js";

export type ContactMessage = { name: string; email: string; subject: string; message: string };

const escapeHtml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

export const sendContactMessage = async ({ name, email, subject, message }: ContactMessage): Promise<void> => {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass || !config.contactEmail) {
    throw new HttpError(503, "Contact service is unavailable");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  const safe = { name: escapeHtml(name), email: escapeHtml(email), subject: escapeHtml(subject), message: escapeHtml(message) };
  try {
    await transporter.sendMail({
      from: config.smtp.user,
      to: config.contactEmail,
      replyTo: email,
      subject,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `<h2>Portfolio contact message</h2><p><strong>Name:</strong> ${safe.name}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Subject:</strong> ${safe.subject}</p><p>${safe.message.replaceAll("\n", "<br>")}</p>`,
    });
  } catch (error) {
    const transportError = error as { code?: string; responseCode?: number };
    console.error("Contact email delivery failed", {
      code: transportError.code,
      responseCode: transportError.responseCode,
    });
    throw new HttpError(502, "Unable to send message");
  }
};