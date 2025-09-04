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

export const validatePhoto = [
  body("alt")
    .isLength({ min: 1, max: 255 })
    .withMessage("Le titre doit contenir entre 1 et 255 caractères"),
  body("tags")
    .custom((value: any) => {
      try {
        const tags = JSON.parse(value);
        return Array.isArray(tags) && tags.length <= 10;
      } catch {
        return false;
      }
    })
    .withMessage(
      "Les tags doivent être un tableau JSON valide avec maximum 10 éléments"
    ),
  body("tags")
    .custom((value: any) => {
      try {
        const tags = JSON.parse(value);
        return tags.every(
          (tag: any) =>
            typeof tag === "string" && tag.length >= 1 && tag.length <= 50
        );
      } catch {
        return false;
      }
    })
    .withMessage("Chaque tag doit être une chaîne entre 1 et 50 caractères"),
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Données d'entrée non valides",
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];

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
