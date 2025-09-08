// services/UserService.ts
import { UserModel } from "../models/userModel";
import { User, UserType, UpdateUserRequest, CreateUserRequest } from "../types";

export class UserService {
  /**
   * Récupère tous les utilisateurs
   */
  static async findAll(): Promise<User[]> {
    try {
      return await UserModel.findAll();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Erreur lors de la récupération des utilisateurs");
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async create(userData: CreateUserRequest): Promise<User> {
    try {
      return await UserModel.create(userData);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la création de l'utilisateur");
    }
  }

  /**
   * Met à jour un utilisateur existant
   */
  static async update(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      return await UserModel.update(id, userData);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  /**
   * Supprime un utilisateur
   */
  static async delete(id: number): Promise<boolean> {
    try {
      return await UserModel.delete(id);
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    }
  }

  /**
   * Recherche des utilisateurs par critères
   */
  static async search(criteria: {
    email?: string;
    first_name?: string;
    last_name?: string;
    type?: UserType;
    is_verified?: boolean;
  }): Promise<User[]> {
    try {
      return await UserModel.search(criteria);
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error("Erreur lors de la recherche des utilisateurs");
    }
  }
}
