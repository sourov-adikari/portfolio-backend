import { getDatabase } from "../services/mongodb-service.js";
import type { Db, Document } from "mongodb";
import type { Education, Experience, Language, NavItem, PersonalInfo, ProfileDetails, Project, Service, SkillDetail, SocialLink } from "../types/portfolio.js";

const COLLECTIONS = {
  personal: "personal_info",
  profile: "profile",
  navigation: "navigation",
  skills: "skills",
  skillDetails: "skill_details",
  traits: "professional_traits",
  services: "services",
  experience: "experience",
  education: "education",
  languages: "languages",
  socials: "socials",
  projects: "projects",
} as const;

const collection = <T extends Document>(db: Db, name: string) => db.collection<T>(name);

const getSingleton = async <T extends Document>(name: string): Promise<T> => {
  const db = await getDatabase();
  const document = await collection<T>(db, name).findOne({ key: "main" } as Document);
  if (!document) throw new Error(`MongoDB collection '${name}' has not been migrated`);
  return document;
};

export const getPersonalInfo = () => getSingleton<PersonalInfo & { key: string }>(COLLECTIONS.personal);
export const getProfileDetails = () => getSingleton<ProfileDetails & { key: string }>(COLLECTIONS.profile);
export const getNavigation = async (): Promise<NavItem[]> => {
  const db = await getDatabase();
  return collection<NavItem>(db, COLLECTIONS.navigation).find({}).sort({ order: 1 }).toArray();
};
export const getSkills = async () => {
  const db = await getDatabase();
  const [skills, skillDetails, traits] = await Promise.all([
    collection<{ category: string; items: string[] }>(db, COLLECTIONS.skills).find({}).sort({ order: 1 }).toArray(),
    collection<SkillDetail & { order?: number }>(db, COLLECTIONS.skillDetails).find({}).sort({ order: 1 }).toArray(),
    collection<{ value: string; order?: number }>(db, COLLECTIONS.traits).find({}).sort({ order: 1 }).toArray(),
  ]);
  const grouped = Object.fromEntries(skills.map(({ category, items }) => [category, items]));
  return { skills: grouped, skillDetails, professionalTraits: traits.map((item) => item.value) };
};
export const getServices = async () => {
  const db = await getDatabase();
  return collection<Service & { order?: number }>(db, COLLECTIONS.services).find({}).sort({ order: 1 }).toArray();
};
export const getExperience = async () => {
  const db = await getDatabase();
  return collection<Experience & { order?: number }>(db, COLLECTIONS.experience).find({}).sort({ order: 1 }).toArray();
};
export const getEducation = async () => {
  const db = await getDatabase();
  return collection<Education & { order?: number }>(db, COLLECTIONS.education).find({}).sort({ order: 1 }).toArray();
};
export const getLanguages = async () => {
  const db = await getDatabase();
  return collection<Language & { order?: number }>(db, COLLECTIONS.languages).find({}).sort({ order: 1 }).toArray();
};
export const getSocials = async () => {
  const db = await getDatabase();
  return collection<SocialLink & { order?: number }>(db, COLLECTIONS.socials).find({}).sort({ order: 1 }).toArray();
};
export const getAllProjects = async (): Promise<Project[]> => {
  const db = await getDatabase();
  return collection<Project>(db, COLLECTIONS.projects).find({}).sort({ year: -1, title: 1 }).toArray();
};
export const getProjectBySlug = async (slug: string): Promise<Project | null> => {
  const db = await getDatabase();
  return collection<Project>(db, COLLECTIONS.projects).findOne({ slug });
};
export const getFeaturedProjects = async (): Promise<Project[]> => {
  const db = await getDatabase();
  return collection<Project>(db, COLLECTIONS.projects).find({ featured: true }).sort({ year: -1, title: 1 }).toArray();
};
