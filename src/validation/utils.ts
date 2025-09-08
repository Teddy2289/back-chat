// validation/utils.ts
import { Request } from "express";
import { ZodSchema } from "zod";

export function validateQuery<T>(schema: ZodSchema<T>, req: Request): T {
  return schema.parse(req.query);
}

export function validateParams<T>(schema: ZodSchema<T>, req: Request): T {
  return schema.parse(req.params);
}

// Remplacez toutes les fonctions par celles-ci :
export function validateData<T>(schema: ZodSchema<T>, data: any): T {
  return schema.parse(data);
}

export function validateRequest<T>(schema: ZodSchema<T>, req: any): T {
  return schema.parse(req.body);
}

export function handleValidationError(error: any) {
  // Vérifiez si c'est une erreur Zod
  if (error.name === "ZodError" && error.errors) {
    return {
      success: false,
      message: "Erreur de validation des données",
      errors: error.errors.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })),
    };
  }

  // Si c'est une string (message d'erreur déjà formaté)
  if (typeof error === "string") {
    try {
      const parsedError = JSON.parse(error);
      return {
        success: false,
        message: "Erreur de validation",
        errors: Array.isArray(parsedError) ? parsedError : [parsedError],
      };
    } catch {
      return {
        success: false,
        message: error,
        errors: [{ message: error }],
      };
    }
  }

  // Pour les autres types d'erreurs
  return {
    success: false,
    message: error.message || "Erreur de validation inconnue",
    errors: [{ message: error.message || "Erreur inconnue" }],
  };
}
