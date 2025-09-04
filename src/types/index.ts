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
