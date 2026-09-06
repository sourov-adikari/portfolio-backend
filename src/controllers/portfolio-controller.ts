import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/error-handler.js";
import { fetchPublicRepositories } from "../services/github-service.js";
import { sendContactMessage, type ContactMessage } from "../services/contact-service.js";
import { subscribeToNewsletter } from "../services/newsletter-service.js";
import { getAllProjects, getEducation as getEducationData, getExperience as getExperienceData, getFeaturedProjects, getLanguages as getLanguagesData, getNavigation, getPersonalInfo, getProfileDetails, getProjectBySlug, getServices as getServicesData, getSkills as getSkillsData, getSocials as getSocialsData } from "../repositories/portfolio-repository.js";

const respond = <T extends Record<string, unknown>>(response: Parameters<RequestHandler>[1], payload: T, statusCode = 200) => response.status(statusCode).json({ success: true, ...payload, meta: { apiVersion: "1.0", generatedAt: new Date().toISOString() } });

export const getPortfolio: RequestHandler = asyncHandler(async (_request, response) => {
  const [personalInfo, profileDetails, navItems, skills, experience, education, languages, socials, services, projects, featuredProjects] = await Promise.all([getPersonalInfo(), getProfileDetails(), getNavigation(), getSkillsData(), getExperienceData(), getEducationData(), getLanguagesData(), getSocialsData(), getServicesData(), getAllProjects(), getFeaturedProjects()]);
  respond(response, { personalInfo, profileDetails, navItems, ...skills, experience, education, languages, socials, services, projects, featuredProjects });
});
export const getProjects: RequestHandler = asyncHandler(async (_request, response) => { const [projects, featuredProjects] = await Promise.all([getAllProjects(), getFeaturedProjects()]); respond(response, { projects, featuredProjects }); });
export const getProject: RequestHandler = asyncHandler(async (request, response) => { const slugParam = request.params.slug; const slug = typeof slugParam === "string" ? slugParam.trim() : ""; if (!slug) { throw new HttpError(400, "Project slug is required", "INVALID_PROJECT_SLUG");} const project = await getProjectBySlug(slug); if (!project) { throw new HttpError(404, "Project not found", "PROJECT_NOT_FOUND");} respond(response, { project });});
export const getSkills: RequestHandler = asyncHandler(async (_request, response) => respond(response, await getSkillsData()));
export const getExperience: RequestHandler = asyncHandler(async (_request, response) => respond(response, { experience: await getExperienceData() }));
export const getEducation: RequestHandler = asyncHandler(async (_request, response) => respond(response, { education: await getEducationData() }));
export const getLanguages: RequestHandler = asyncHandler(async (_request, response) => respond(response, { languages: await getLanguagesData() }));
export const getSocials: RequestHandler = asyncHandler(async (_request, response) => respond(response, { socials: await getSocialsData() }));
export const getServices: RequestHandler = asyncHandler(async (_request, response) => respond(response, { services: await getServicesData() }));
export const getGithubProjects = asyncHandler(async (_request, response) => respond(response, { repositories: await fetchPublicRepositories() }));

const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
const isPlainString = (value: unknown): value is string => typeof value === "string";
const isContactMessage = (value: unknown): value is ContactMessage => { if (!value || typeof value !== "object" || Array.isArray(value)) return false; const body = value as Record<string, unknown>; const requiredKeys = ["name", "email", "subject", "message"]; const keys = Object.keys(body); return keys.length === requiredKeys.length && requiredKeys.every((key) => keys.includes(key) && isPlainString(body[key])); };
export const postContact = asyncHandler(async (request, response) => { if (!isContactMessage(request.body)) throw new HttpError(400, "Request body must contain name, email, subject, and message", "INVALID_CONTACT_PAYLOAD"); const name = request.body.name.trim(), email = request.body.email.trim().toLowerCase(), subject = request.body.subject.trim(), message = request.body.message.trim(); if (!name || name.length > 100 || !subject || subject.length > 150 || message.length < 20 || message.length > 1200 || email.length > 150 || !EMAIL_PATTERN.test(email)) throw new HttpError(400, "Please provide a valid email address and contact details", "INVALID_CONTACT_DETAILS"); await sendContactMessage({ name, email, subject, message }); respond(response, { message: "Message sent successfully" }); });
export const postNewsletterSubscribe = asyncHandler(async (request, response) => { if (!request.body || typeof request.body !== "object" || Array.isArray(request.body)) throw new HttpError(400, "Email is required", "INVALID_NEWSLETTER_PAYLOAD"); const emailValue = (request.body as Record<string, unknown>).email; if (!isPlainString(emailValue)) throw new HttpError(400, "Email is required", "INVALID_NEWSLETTER_PAYLOAD"); const email = emailValue.trim().toLowerCase(); if (email.length > 150 || !EMAIL_PATTERN.test(email)) throw new HttpError(400, "Please enter a valid email address", "INVALID_NEWSLETTER_EMAIL"); const status = await subscribeToNewsletter({ email }); const message = status === "already_subscribed" ? "You are already subscribed" : status === "pending_confirmation" ? "Please check your email to confirm your subscription" : "Subscription successful"; respond(response, { message, status }); });
