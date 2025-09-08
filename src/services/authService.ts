// services/AuthService.ts
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import { PasswordUtils } from "../utils/passwordUtils";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  JwtPayload,
} from "../types";
import { VerificationModel } from "../models/verificationModel";
import { EmailService } from "./emailService";
import crypto from "crypto";

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRES_IN = "7d";

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: "Un utilisateur avec cet email existe déjà",
        };
      }

      const hashedPassword = await PasswordUtils.hashPassword(
        userData.password
      );
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword,
      });

      // Générer token de vérification
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await VerificationModel.createToken(user.id!, verificationToken);

      try {
        // Essayer d'envoyer l'email de vérification
        await EmailService.sendVerificationEmail(user, verificationToken);

        const { password, ...userWithoutPassword } = user;

        return {
          success: true,
          message:
            "Compte créé. Vérifiez votre email pour activer votre compte.",
          user: userWithoutPassword,
        };
      } catch (emailError) {
        // Si l'email échoue, retourner quand même le succès mais avec un message différent
        console.warn("Email non envoyé, mais compte créé:", emailError);

        const { password, ...userWithoutPassword } = user;

        return {
          success: true,
          message:
            "Compte créé. Contactez l'administrateur pour activer votre compte.",
          user: userWithoutPassword,
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Erreur lors de la création du compte",
      };
    }
  }

  static async verifyEmail(
    userId: number,
    token: string
  ): Promise<AuthResponse> {
    try {
      const validToken = await VerificationModel.findValidToken(userId, token);
      if (!validToken) {
        return {
          success: false,
          message: "Token de vérification invalide ou expiré",
        };
      }

      await UserModel.updateVerificationStatus(userId, true);
      await VerificationModel.deleteToken(validToken.id!);

      const user = await UserModel.findById(userId);
      if (!user) {
        return { success: false, message: "Utilisateur non trouvé" };
      }

      const jwtToken = this.generateToken(user.id!, user.email);
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: "Compte vérifié avec succès",
        token: jwtToken,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return { success: false, message: "Erreur lors de la vérification" };
    }
  }

  static async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      // Trouver l'utilisateur par email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: "Aucun utilisateur trouvé avec cet email",
        };
      }

      // Vérifier si le compte est déjà vérifié
      if (user.is_verified) {
        return {
          success: false,
          message: "Ce compte est déjà vérifié",
        };
      }

      // Supprimer les anciens tokens de vérification
      await VerificationModel.deleteUserTokens(user.id!);

      // Générer un nouveau token de vérification
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await VerificationModel.createToken(user.id!, verificationToken);

      // Envoyer le nouvel email de vérification
      await EmailService.sendVerificationEmail(user, verificationToken);

      return {
        success: true,
        message: "Email de vérification renvoyé avec succès",
      };
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email de vérification",
      };
    }
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Trouver l'utilisateur par email
      const user = await UserModel.findByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: "Email ou mot de passe incorrect",
        };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await PasswordUtils.comparePassword(
        loginData.password,
        user.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Email ou mot de passe incorrect",
        };
      }

      // Vérifier si le compte est activé
      if (!user.is_verified) {
        return {
          success: false,
          message: "Veuillez vérifier votre compte avant de vous connecter",
        };
      }

      // Générer le token JWT
      const token = this.generateToken(user.id!, user.email);

      // Retourner la réponse sans le mot de passe
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: "Connexion réussie",
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Erreur lors de la connexion",
      };
    }
  }

  private static generateToken(userId: number, email: string): string {
    const payload: JwtPayload = { userId, email };
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
  }
}
