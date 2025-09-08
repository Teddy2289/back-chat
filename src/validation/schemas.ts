import { UserType } from "../generated/prisma";
import { z } from "zod";

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const verifyEmailSchema = z.object({
  userId: z.number().int().positive("ID utilisateur invalide"),
  token: z.string().min(1, "Token requis"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Email invalide"),
});

// User Schemas
export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  type: z.nativeEnum(UserType).optional(),
  is_verified: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .optional(),
  first_name: z.string().min(1, "Le prénom est requis").optional(),
  last_name: z.string().min(1, "Le nom est requis").optional(),
  type: z.nativeEnum(UserType).optional(),
  is_verified: z.boolean().optional(),
});

export const userSearchSchema = z.object({
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  type: z.nativeEnum(UserType).optional(),
  is_verified: z.boolean().optional(),
});

// Model Schemas
export const createModelSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis"),
  age: z
    .number()
    .int()
    .min(0, "L'âge doit être positif")
    .max(150, "Âge invalide"),
  nationalite: z.string().min(1, "La nationalité est requise"),
  passe_temps: z.string().min(1, "Le passe-temps est requis"),
  citation: z.string().min(1, "La citation est requise"),
  domicile: z.string().min(1, "Le domicile est requis"),
  photo: z.string().optional(),
  localisation: z.string().min(1, "La localisation est requise"),
});

export const updateModelSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis").optional(),
  age: z
    .number()
    .int()
    .min(0, "L'âge doit être positif")
    .max(150, "Âge invalide")
    .optional(),
  nationalite: z.string().min(1, "La nationalité est requise").optional(),
  passe_temps: z.string().min(1, "Le passe-temps est requis").optional(),
  citation: z.string().min(1, "La citation est requise").optional(),
  domicile: z.string().min(1, "Le domicile est requis").optional(),
  photo: z.string().optional(),
  localisation: z.string().min(1, "La localisation est requise").optional(),
});

export const modelSearchSchema = z.object({
  prenom: z.string().optional(),
  nationalite: z.string().optional(),
  localisation: z.string().optional(),
  age_min: z.number().int().min(0).optional(),
  age_max: z.number().int().min(0).optional(),
});

// Photo Schemas
export const createPhotoSchema = z.object({
  url: z.string().url("URL invalide"),
  alt: z.string().min(1, "Le texte alternatif est requis"),
  tags: z.array(z.string()).default([]),
});

export const updatePhotoSchema = z.object({
  url: z.string().url("URL invalide").optional(),
  alt: z.string().min(1, "Le texte alternatif est requis").optional(),
  tags: z.array(z.string()).optional(),
});

// Settings Schemas
export const generalSettingsSchema = z.object({
  site_title: z.string().min(1, "Le titre du site est requis"),
  site_subtitle: z.string().optional(),
  social_title: z.string().optional(),
  facebook_url: z
    .string()
    .url("URL Facebook invalide")
    .optional()
    .or(z.literal("")),
  twitter_url: z
    .string()
    .url("URL Twitter invalide")
    .optional()
    .or(z.literal("")),
  instagram_url: z
    .string()
    .url("URL Instagram invalide")
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .url("URL LinkedIn invalide")
    .optional()
    .or(z.literal("")),
  youtube_url: z
    .string()
    .url("URL YouTube invalide")
    .optional()
    .or(z.literal("")),
});

export const logoSettingsSchema = z
  .object({
    logo_type: z.enum(["image", "text"]),
    logo_image: z.string().optional(),
    logo_text: z.string().optional(),
    logo_slogan: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.logo_type === "image") return !!data.logo_image;
      if (data.logo_type === "text") return !!data.logo_text;
      return true;
    },
    {
      message: "Logo image ou texte requis selon le type",
      path: ["logo_image"],
    }
  );

export const slideSchema = z.object({
  image: z.string().min(1, "L'image est requise"),
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string().optional(),
  is_active: z.boolean().default(true),
  order: z.number().int().min(0, "L'ordre doit être positif"),
});

export const homeSettingsSchema = z.object({
  main_title: z.string().min(1, "Le titre principal est requis"),
  main_subtitle: z.string().optional(),
  show_social_in_hero: z.boolean().default(true),
  slides: z.array(slideSchema).default([]),
});

export const gallerySettingsSchema = z.object({
  gallery_title: z.string().min(1, "Le titre de la galerie est requis"),
  gallery_subtitle: z.string().optional(),
  show_gallery: z.boolean().default(true),
  items_per_page: z
    .number()
    .int()
    .min(1, "Minimum 1 item par page")
    .max(100, "Maximum 100 items par page"),
});

export const aboutSettingsSchema = z.object({
  about_title: z.string().min(1, "Le titre À propos est requis"),
  selected_model_id: z
    .number()
    .int()
    .positive("ID modèle invalide")
    .nullable()
    .optional(),
  show_custom_content: z.boolean().default(false),
  custom_content: z.string().optional(),
});

export const toggleSectionSchema = z.object({
  is_active: z.boolean(),
});
