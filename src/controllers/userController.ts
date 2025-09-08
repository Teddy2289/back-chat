// controllers/UserController.ts
import { Request, Response } from "express";
import { UserService } from "../services/userService";
import {
  createUserSchema,
  updateUserSchema,
  userSearchSchema,
} from "../validation/schemas";
import {
  handleValidationError,
  validateRequest,
  validateQuery,
} from "../validation/utils";

export class UserController {
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

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        });
      }

      const user = await UserService.findById(userId);
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

  static async createUser(req: Request, res: Response) {
    try {
      const userData = validateRequest(createUserSchema, req);
      const user = await UserService.create(userData);

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        data: user,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Create user error:", error);
      if (error instanceof Error) {
        if (error.message.includes("existe déjà")) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'utilisateur",
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        });
      }

      const userData = validateRequest(updateUserSchema, req);
      const user = await UserService.update(userId, userData);

      res.status(200).json({
        success: true,
        message: "Utilisateur mis à jour avec succès",
        data: user,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

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
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de l'utilisateur",
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        });
      }

      await UserService.delete(userId);
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
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'utilisateur",
      });
    }
  }

  static async searchUsers(req: Request, res: Response) {
    try {
      const criteria = validateQuery(userSearchSchema, req);
      const users = await UserService.search(criteria);

      res.status(200).json({
        success: true,
        message: "Recherche d'utilisateurs effectuée avec succès",
        data: users,
        count: users.length,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Search users error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la recherche des utilisateurs",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
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

  static async updateProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userData = validateRequest(updateUserSchema, req);

      // Empêcher la modification du type et du statut de vérification
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
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update profile error:", error);
      if (error instanceof Error) {
        if (error.message.includes("utilise déjà cet email")) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du profil",
      });
    }
  }
}
