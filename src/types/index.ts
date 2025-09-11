import { JsonValue } from "../generated/prisma/runtime/library";
import { UserType as PrismaUserType } from "../generated/prisma";

// Utilisez le type de Prisma directement
export type UserType = PrismaUserType;

export interface User {
  id?: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
  type: UserType;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<User, "password">;
}

export interface JwtPayload {
  userId: number;
  email: string;
}

export interface VerificationToken {
  id?: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at?: Date;
}

export interface Photo {
  id: number;
  url: string;
  alt: string;
  tags: JsonValue[];
  likes: number;
  created_at: Date;
  updated_at: Date;
}
// User
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  type?: UserType;
  is_verified?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  type?: UserType;
  is_verified?: boolean;
}
// Models
export interface Model {
  id: number;
  prenom: string;
  age: number;
  nationalite: string;
  passe_temps: string;
  citation: string;
  domicile: string;
  photo?: string;
  localisation: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateModelRequest {
  prenom: string;
  age: number;
  nationalite: string;
  passe_temps: string;
  citation: string;
  domicile: string;
  photo?: string;
  localisation: string;
}

export interface UpdateModelRequest {
  prenom?: string;
  age?: number;
  nationalite?: string;
  passe_temps?: string;
  citation?: string;
  domicile?: string;
  photo?: string;
  localisation?: string;
}

export interface GeneralSettings {
  site_title: string;
  site_subtitle?: string;
  associated_model_id?: number;
  show_navbar: boolean;
  social_title?: string;
  social_links: SocialLink[];
}

// ✅ Nouveau type pour les liens sociaux
export interface SocialLink {
  platform: string; // 'facebook', 'twitter', 'instagram', etc.
  url: string;
  icon: string; // nom de l'icône (ex: 'fa-facebook', 'mdi-twitter')
  is_active: boolean;
}

export interface LogoSettings {
  logo_type: "image" | "text";
  logo_image?: string;
  logo_text?: string;
  logo_slogan?: string;
}

export interface Slide {
  image: string;
  title: string;
  subtitle: string;
  is_active: boolean;
  order: number;
}

export interface HomeSettings {
  main_title: string;
  main_subtitle?: string;
  show_social_in_hero: boolean;
  slides: Slide[];
}

export interface GallerySettings {
  gallery_title: string;
  gallery_subtitle: string;
  show_gallery: boolean;
  items_per_page: number;
}

export interface AboutSettings {
  about_title: string;
  selected_model_id?: number;
  show_custom_content: boolean;
  custom_content?: string;
}

export type SettingsSection = "general" | "logo" | "home" | "gallery" | "about";

export interface SiteSettings {
  id: number;
  section: SettingsSection;
  settings:
    | GeneralSettings
    | LogoSettings
    | HomeSettings
    | GallerySettings
    | AboutSettings;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Categorie {
  id: number;
  name: string;
  description?: string;
  slug: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  models?: ModelCategorie[];
}

export interface CreateCategorieRequest {
  name: string;
  description?: string;
  slug: string;
  is_active?: boolean;
}

export interface UpdateCategorieRequest {
  name?: string;
  description?: string;
  slug?: string;
  is_active?: boolean;
}

export interface Model {
  id: number;
  prenom: string;
  age: number;
  nationalite: string;
  passe_temps: string;
  citation: string;
  domicile: string;
  photo?: string;
  localisation: string;
  created_at: Date;
  updated_at: Date;
  categories?: ModelCategorie[];
}

export interface CreateModelRequest {
  prenom: string;
  age: number;
  nationalite: string;
  passe_temps: string;
  citation: string;
  domicile: string;
  photo?: string;
  localisation: string;
  categoryIds?: number[]; // IDs des catégories
}

export interface UpdateModelRequest {
  prenom?: string;
  age?: number;
  nationalite?: string;
  passe_temps?: string;
  citation?: string;
  domicile?: string;
  photo?: string;
  localisation?: string;
  categoryIds?: number[]; // IDs des catégories
}

export interface ModelCategorie {
  id: number;
  modelId: number;
  categorieId: number;
  created_at: Date;
  model?: Model; // optionnel si tu veux inclure le model
  categorie?: Categorie; // optionnel si tu veux inclure la catégorie
}

export interface CreateModelCategorieRequest {
  modelId: number;
  categorieId: number;
}
