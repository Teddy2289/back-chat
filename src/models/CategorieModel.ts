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
    return await prisma.categorie.findUnique({
      where: { id },
      include: {
        models: {
          include: { model: true }, // inclut les modèles via le pivot
        },
      },
    });
  }

  static async findBySlug(slug: string): Promise<Categorie | null> {
    return await prisma.categorie.findUnique({
      where: { slug },
      include: {
        models: {
          include: { model: true },
        },
      },
    });
  }

  static async findAll(): Promise<Categorie[]> {
    return await prisma.categorie.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: { model: true },
        },
      },
    });
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
}
