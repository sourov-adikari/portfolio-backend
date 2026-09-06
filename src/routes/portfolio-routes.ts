import { Router } from "express";
import {
  getEducation,
  getExperience,
  getGithubProjects,
  getLanguages,
  getPortfolio,
  getProject,
  getProjects,
  getServices,
  getSkills,
  getSocials,
  postContact,
  postNewsletterSubscribe,
} from "../controllers/portfolio-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const portfolioRouter = Router();

portfolioRouter.get("/portfolio", asyncHandler(getPortfolio));
portfolioRouter.get("/projects", asyncHandler(getProjects));
portfolioRouter.get("/projects/github", getGithubProjects);
portfolioRouter.get("/projects/:slug", asyncHandler(getProject));
portfolioRouter.get("/skills", asyncHandler(getSkills));
portfolioRouter.get("/experience", asyncHandler(getExperience));
portfolioRouter.get("/education", asyncHandler(getEducation));
portfolioRouter.get("/languages", asyncHandler(getLanguages));
portfolioRouter.get("/socials", asyncHandler(getSocials));
portfolioRouter.get("/services", asyncHandler(getServices));
portfolioRouter.post("/contact", postContact);
portfolioRouter.post("/newsletter/subscribe", postNewsletterSubscribe);
