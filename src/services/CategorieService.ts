// services/CategorieService.ts
import prisma from "../config/prisma";
import { CategorieModel } from "../models/CategorieModel";
import {
  Categorie,
  CreateCategorieRequest,
  UpdateCategorieRequest,
} from "../types";

export class CategorieService {
  /**
   * Récupère toutes les catégories actives
   */
  static async findAll(): Promise<Categorie[]> {
    try {
      return await CategorieModel.findAll();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Erreur lors de la récupération des catégories");
    }
  }

  /**
   * Récupère une catégorie par son ID
   */
  static async findById(id: number): Promise<Categorie | null> {
    try {
      return await CategorieModel.findById(id);
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      throw new Error("Erreur lors de la récupération de la catégorie");
    }
  }

  /**
   * Récupère une catégorie par son slug
   */
  static async findBySlug(slug: string): Promise<Categorie | null> {
    try {
      return await CategorieModel.findBySlug(slug);
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      throw new Error("Erreur lors de la récupération de la catégorie");
    }
  }

  /**
   * Crée une nouvelle catégorie
   */
  static async create(
    categorieData: CreateCategorieRequest
  ): Promise<Categorie> {
    try {
      // Validation
      if (!categorieData.name || !categorieData.slug) {
        throw new Error("Le nom et le slug sont obligatoires");
      }

      // Vérifier si le slug existe déjà
      const existingCategory = await this.findBySlug(categorieData.slug);
      if (existingCategory) {
        throw new Error("Une catégorie avec ce slug existe déjà");
      }

      return await CategorieModel.create(categorieData);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la création de la catégorie");
    }
  }

  /**
   * Met à jour une catégorie
   */
  static async update(
    id: number,
    categorieData: UpdateCategorieRequest
  ): Promise<Categorie> {
    try {
      // Vérifier si la catégorie existe
      const existingCategory = await this.findById(id);
      if (!existingCategory) {
        throw new Error("Catégorie non trouvée");
      }

      // Vérifier si le slug existe déjà (si modifié)
      if (categorieData.slug && categorieData.slug !== existingCategory.slug) {
        const categoryWithSlug = await this.findBySlug(categorieData.slug);
        if (categoryWithSlug) {
          throw new Error("Une catégorie avec ce slug existe déjà");
        }
      }

      const updatedCategory = await CategorieModel.update(id, categorieData);
      if (!updatedCategory) {
        throw new Error("Erreur lors de la mise à jour de la catégorie");
      }

      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la mise à jour de la catégorie");
    }
  }

  /**
   * Supprime une catégorie
   */
  // services/CategorieService.ts - Modifiez la méthode delete
  static async delete(id: number): Promise<boolean> {
    try {
      // Vérifier si la catégorie existe
      const existingCategory = await this.findById(id);
      if (!existingCategory) {
        throw new Error("Catégorie non trouvée");
      }

      // Supprimer d'abord toutes les associations avec les modèles
      await prisma.modelCategorie.deleteMany({
        where: { categorieId: id },
      });

      // Puis supprimer la catégorie
      return await CategorieModel.delete(id);
    } catch (error) {
      console.error("Error deleting category:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur lors de la suppression de la catégorie");
    }
  }

  /**
   * Ajoute un modèle à une catégorie
   */
  static async addModelToCategory(
    categoryId: number,
    modelId: number
  ): Promise<void> {
    try {
      await CategorieModel.addModelToCategory(categoryId, modelId);
    } catch (error) {
      console.error("Error adding model to category:", error);
      throw new Error("Erreur lors de l'ajout du modèle à la catégorie");
    }
  }

  /**
   * Retire un modèle d'une catégorie
   */
  static async removeModelFromCategory(
    categoryId: number,
    modelId: number
  ): Promise<void> {
    try {
      const success = await CategorieModel.removeModelFromCategory(
        categoryId,
        modelId
      );
      if (!success) {
        throw new Error(
          "Aucune relation trouvée entre ce modèle et cette catégorie"
        );
      }
    } catch (error) {
      console.error("Error removing model from category:", error);
      throw new Error("Erreur lors du retrait du modèle de la catégorie");
    }
  }
}
