import { Request, Response } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Register controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error("Login controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      // L'utilisateur est attaché à la requête par le middleware d'authentification
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

      if (!userId || !token) {
        return res.status(400).json({
          success: false,
          message: "Paramètres userId et token requis",
        });
      }

      const result = await AuthService.verifyEmail(
        parseInt(userId as string),
        token as string
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Verify email controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification du email",
      });
    }
  }
  static async resendVerificationEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "L'email est requis",
        });
      }

      const result = await AuthService.resendVerificationEmail(email);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Resend verification controller error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la demande de renvoi de vérification",
      });
    }
  }
}
