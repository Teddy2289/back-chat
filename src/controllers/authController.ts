// controllers/AuthController.ts
import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../validation/schemas";
import { handleValidationError, validateRequest } from "../validation/utils";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userData = validateRequest(registerSchema, req);
      const result = await AuthService.register(userData);

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Register controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const loginData = validateRequest(loginSchema, req);
      const result = await AuthService.login(loginData);

      res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Login controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      res.status(200).json({
        success: true,
        message: "Profil récupéré avec succès",
        user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { userId, token } = req.query;
      const validated = verifyEmailSchema.parse({
        userId: parseInt(userId as string),
        token: token as string,
      });

      const result = await AuthService.verifyEmail(
        validated.userId,
        validated.token
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Verify email controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification du email",
      });
    }
  }

  static async resendVerificationEmail(req: Request, res: Response) {
    try {
      const { email } = validateRequest(resendVerificationSchema, req);
      const result = await AuthService.resendVerificationEmail(email);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Resend verification controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la demande de renvoi de vérification",
      });
    }
  }
}
