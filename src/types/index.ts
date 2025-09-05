export enum UserType {
  ADMIN = "Admin",
  AGENT = "Agent",
  CLIENT = "Client",
  USER = "User",
}
export interface User {
  id?: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
  type?: UserType;
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
  tags: string[];
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
  photo?:string;
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
  photo?:string;
  localisation: string;
}

export interface UpdateModelRequest {
  prenom?: string;
  age?: number;
  nationalite?: string;
  passe_temps?: string;
  citation?: string;
  domicile?: string;
  photo?:string;
  localisation?: string;
}

export interface GeneralSettings {
  site_title: string;
  site_subtitle: string;
  social_title: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}

export interface LogoSettings {
  logo_type: 'image' | 'text';
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
  main_subtitle: string;
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

export type SettingsSection =
    | 'general'
    | 'logo'
    | 'home'
    | 'gallery'
    | 'about';

export interface SiteSettings {
  id: number;
  section: SettingsSection;
  settings: GeneralSettings | LogoSettings | HomeSettings | GallerySettings | AboutSettings;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}