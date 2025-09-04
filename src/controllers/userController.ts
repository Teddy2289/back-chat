import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest, UpdateUserRequest } from "../types";

export class UserController {
  /**
   * Récupère tous les utilisateurs
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.findAll();

      res.status(200).json({
        success: true,
        message: "Utilisateurs récupérés avec succès",
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des utilisateurs",
      });
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        });
      }

      const user = await UserService.findById(parseInt(id));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      res.status(200).json({
        success: true,
        message: "Utilisateur récupéré avec succès",
        data: user,
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'utilisateur",
      });
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserRequest = req.body;

      // Validation des champs requis
      if (
        !userData.email ||
        !userData.password ||
        !userData.first_name ||
        !userData.last_name
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tous les champs obligatoires doivent être remplis (email, password, first_name, last_name)",
        });
      }

      const user = await UserService.create(userData);

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        data: user,
      });
    } catch (error) {
      console.error("Create user error:", error);

      if (error instanceof Error) {
        if (error.message.includes("existe déjà")) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'utilisateur",
      });
    }
  }

  /**
   * Met à jour un utilisateur existant
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        });
      }

      const userData: UpdateUserRequest = req.body;

      const user = await UserService.update(parseInt(id), userData);

      res.status(200).json({
        success: true,
        message: "Utilisateur mis à jour avec succès",
        data: user,
      });
    } catch (error) {
      console.error("Update user error:", error);

      if (error instanceof Error) {
        if (error.message.includes("non trouvé")) {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }

        if (error.message.includes("utilise déjà cet email")) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de l'utilisateur",
      });
    }
  }

  /**
   * Supprime un utilisateur
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        });
      }

      await UserService.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      console.error("Delete user error:", error);

      if (error instanceof Error) {
        if (error.message.includes("non trouvé")) {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'utilisateur",
      });
    }
  }

  /**
   * Recherche des utilisateurs par critères
   */
  static async searchUsers(req: Request, res: Response) {
    try {
      const { email, first_name, last_name, type, is_verified } = req.query;

      // Convertir is_verified en boolean si fourni
      let isVerifiedBool: boolean | undefined;
      if (is_verified !== undefined) {
        isVerifiedBool = is_verified === "true" || is_verified === "1";
      }

      const users = await UserService.search({
        email: email as string,
        first_name: first_name as string,
        last_name: last_name as string,
        type: type as any,
        is_verified: isVerifiedBool,
      });

      res.status(200).json({
        success: true,
        message: "Recherche d'utilisateurs effectuée avec succès",
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la recherche des utilisateurs",
      });
    }
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  static async getProfile(req: Request, res: Response) {
    try {
      // L'utilisateur est attaché à la requête par le middleware d'authentification
      const user = (req as any).user;

      res.status(200).json({
        success: true,
        message: "Profil récupéré avec succès",
        data: user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du profil",
      });
    }
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userData: UpdateUserRequest = req.body;

      // Empêcher la modification du type et du statut de vérification via le profil
      if (userData.type !== undefined || userData.is_verified !== undefined) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à modifier ces champs",
        });
      }

      const updatedUser = await UserService.update(user.id, userData);

      res.status(200).json({
        success: true,
        message: "Profil mis à jour avec succès",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);

      if (error instanceof Error) {
        if (error.message.includes("utilise déjà cet email")) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du profil",
      });
    }
  }
}
