import prisma from "../config/prisma";
import {
  Categorie,
  CreateCategorieRequest,
  UpdateCategorieRequest,
  ModelCategorie,
} from "../types";

export class CategorieModel {
  static async create(
    categorieData: CreateCategorieRequest
  ): Promise<Categorie> {
    return await prisma.categorie.create({
      data: categorieData,
    });
  }

  static async findById(id: number): Promise<Categorie | null> {
    try {
      return await prisma.categorie.findUnique({
        where: { id },
        include: {
          models: {
            include: { model: true }, // inclut les modèles via le pivot
          },
        },
      });
    } catch (error) {
      // En cas d'erreur, fallback vers une requête sans les modèles
      console.warn(
        "Error including models in findById, returning category without models:",
        error.message
      );

      return await prisma.categorie.findUnique({
        where: { id },
      });
    }
  }

  static async findBySlug(slug: string): Promise<Categorie | null> {
    try {
      return await prisma.categorie.findUnique({
        where: { slug },
        include: {
          models: {
            include: { model: true },
          },
        },
      });
    } catch (error) {
      // En cas d'erreur, fallback vers une requête sans les modèles
      console.warn(
        "Error including models in findBySlug, returning category without models:",
        error.message
      );

      return await prisma.categorie.findUnique({
        where: { slug },
      });
    }
  }

  static async findAll(): Promise<Categorie[]> {
    try {
      return await prisma.categorie.findMany({
        where: { is_active: true },
        orderBy: { name: "asc" },
        include: {
          models: {
            include: {
              model: true,
            },
          },
        },
      });
    } catch (error) {
      // En cas d'erreur, fallback vers une requête sans les modèles
      console.warn(
        "Error including models in findAll, returning categories without models:",
        error.message
      );

      return await prisma.categorie.findMany({
        where: { is_active: true },
        orderBy: { name: "asc" },
      });
    }
  }

  static async update(
    id: number,
    categorieData: UpdateCategorieRequest
  ): Promise<Categorie | null> {
    return await prisma.categorie.update({
      where: { id },
      data: categorieData,
    });
  }

  static async delete(id: number): Promise<boolean> {
    const result = await prisma.categorie.delete({
      where: { id },
    });
    return result !== null;
  }

  // ✅ Nouveau : gérer le pivot
  static async addModelToCategory(
    categoryId: number,
    modelId: number
  ): Promise<ModelCategorie> {
    return await prisma.modelCategorie.create({
      data: { categorieId: categoryId, modelId },
    });
  }

  static async removeModelFromCategory(
    categoryId: number,
    modelId: number
  ): Promise<boolean> {
    const result = await prisma.modelCategorie.deleteMany({
      where: { categorieId: categoryId, modelId },
    });
    return result.count > 0;
  }

  // Méthode utilitaire pour nettoyer les relations vers des modèles inexistants
  static async cleanOrphanModelRelations(): Promise<void> {
    try {
      // Trouver toutes les relations où le modèle n'existe pas
      const orphanRelations = await prisma.modelCategorie.findMany({
        where: {
          model: null,
        },
      });

      if (orphanRelations.length > 0) {
        console.log(
          `Found ${orphanRelations.length} orphan model relations, cleaning...`
        );

        await prisma.modelCategorie.deleteMany({
          where: {
            model: null,
          },
        });

        console.log("Orphan model relations cleaned successfully");
      }
    } catch (error) {
      console.error("Error cleaning orphan model relations:", error);
    }
  }
}
