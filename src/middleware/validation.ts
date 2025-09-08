import { Request, Response, NextFunction } from "express";
import { ValidationUtils } from "../utils/validationUtils";
import { RegisterRequest, LoginRequest } from "../types";
import { body, validationResult } from "express-validator";

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = ValidationUtils.validateRegister(req.body as RegisterRequest);

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Données invalides",
      errors,
    });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = ValidationUtils.validateLogin(req.body as LoginRequest);

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Données invalides",
      errors,
    });
    return;
  }

  next();
};

// Remplacez le middleware validatePhoto par ceci :
export const validatePhoto = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Middleware simplifié qui ne fait que passer
  // La validation réelle se fait dans le contrôleur
  next();
};

// Middleware pour vérifier la taille du fichier (10MB max)
export const checkFileSize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (req.file && req.file.size > maxSize) {
    res.status(400).json({
      success: false,
      message: "Le fichier est trop volumineux. Taille maximale: 10MB",
    });
    return;
  }

  next();
};
