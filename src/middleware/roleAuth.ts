// middleware/roleAuth.ts
import { Request, Response, NextFunction } from "express";
import { UserType } from "../generated/prisma";

// Fonction requireRole manquante
export const requireRole = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    if (!req.user.type || !allowedRoles.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: "Permissions insuffisantes pour accéder à cette ressource",
      });
    }

    next();
  };
};

// Middlewares spécifiques
export const requireAdmin = requireRole([UserType.Admin]);
export const requireAgentOrAdmin = requireRole([
  UserType.Admin,
  UserType.Agent,
]);
export const requireClient = requireRole([UserType.Client]);
export const requireUser = requireRole([UserType.User]);

// Middleware pour tout utilisateur authentifié
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise",
    });
  }
  next();
};

// Vérifie si l'utilisateur est vérifié
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.is_verified) {
    return res.status(403).json({
      success: false,
      message: "Votre compte doit être vérifié pour accéder à cette ressource",
    });
  }
  next();
};
