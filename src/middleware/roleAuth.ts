import { Request, Response, NextFunction } from "express";
import { UserType } from "../generated/prisma";

// Définissez une interface pour l'utilisateur dans req.user
interface AuthUser {
  id: number;
  email: string;
  type: UserType;
  is_verified: boolean;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireRole = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    // Correction ici : utilisez user.type au lieu de (req as any).userType
    const userRole = user.type;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Permissions insuffisantes",
      });
    }

    next();
  };
};

// Middlewares spécifiques - CORRIGEZ ces appels
export const requireAdmin = requireRole([UserType.Admin]);
export const requireAgentOrAdmin = requireRole([
  UserType.Admin,
  UserType.Agent,
]);
export const requireClient = requireRole([UserType.Client]);
export const requireUser = requireRole([UserType.User]);
export const requireAnyUser = requireRole([
  UserType.Admin,
  UserType.Agent,
  UserType.Client,
  UserType.User,
]);
