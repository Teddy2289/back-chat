// validation/utils.ts
import { Request } from "express";
import { ZodSchema } from "zod";

export function validateRequest<T>(schema: ZodSchema<T>, req: Request): T {
  return schema.parse(req.body);
}

export function validateQuery<T>(schema: ZodSchema<T>, req: Request): T {
  return schema.parse(req.query);
}

export function validateParams<T>(schema: ZodSchema<T>, req: Request): T {
  return schema.parse(req.params);
}

export function handleValidationError(error: any) {
  if (error.errors) {
    return {
      success: false,
      message: "Validation error",
      errors: error.errors.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    };
  }
  throw error;
}
