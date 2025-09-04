import { Request, Response, NextFunction } from "express";
import { UserType } from "../types";

export const requireRole = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    // Pour l'instant, c'est une structure de base
    const userRole = (req as any).userType || UserType.ADMIN;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Permissions insuffisantes",
      });
    }

    next();
  };
};

// Middlewares spécifiques
export const requireAdmin = requireRole([UserType.ADMIN]);
export const requireAgentOrAdmin = requireRole([
  UserType.ADMIN,
  UserType.AGENT,
]);
export const requireClient = requireRole([UserType.CLIENT, UserType.USER]);
