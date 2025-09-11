// models/ModelModel.ts
import prisma from "../config/prisma";
import { Model, CreateModelRequest, UpdateModelRequest } from "../types";

export class ModelModel {
  static async create(modelData: CreateModelRequest): Promise<Model> {
    const { categoryIds, ...data } = modelData;

    const createdModel = await prisma.model.create({
      data: {
        ...data,
        categories:
          categoryIds && categoryIds.length > 0
            ? {
                create: categoryIds.map((categorieId) => ({
                  categorie: { connect: { id: categorieId } },
                })),
              }
            : undefined,
      },
      include: {
        categories: {
          include: {
            categorie: true, // Inclure les détails de la catégorie
          },
        },
      },
    });

    return {
      ...createdModel,
      photo: createdModel.photo ?? undefined,
      categories: createdModel.categories.map((mc) => ({
        ...mc.categorie, // Utiliser mc.categorie au lieu de mc
        description: mc.categorie.description ?? undefined,
      })),
    };
  }

  static async findById(id: number): Promise<Model | null> {
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            categorie: true,
          },
        },
      },
    });
    if (!model) return null;
    return {
      ...model,
      photo: model.photo === null ? undefined : model.photo,
      categories: model.categories.map((mc) => ({
        ...mc.categorie,
        description:
          mc.categorie.description === null
            ? undefined
            : mc.categorie.description,
      })),
    };
  }

  static async findAll(): Promise<Model[]> {
    const models = await prisma.model.findMany({
      orderBy: { created_at: "desc" },
      include: {
        categories: {
          include: {
            categorie: true,
          },
        },
      },
    });
    return models.map((model) => ({
      ...model,
      photo: model.photo === null ? undefined : model.photo,
      categories: model.categories.map((mc) => ({
        ...mc.categorie,
        description:
          mc.categorie.description === null
            ? undefined
            : mc.categorie.description,
      })),
    }));
  }

  static async delete(id: number): Promise<boolean> {
    const result = await prisma.model.delete({
      where: { id },
    });
    return result !== null;
  }

  static async search(criteria: {
    prenom?: string;
    nationalite?: string;
    localisation?: string;
    age_min?: number;
    age_max?: number;
    categoryIds?: number[];
  }): Promise<Model[]> {
    const where: any = {};

    if (criteria.prenom) {
      where.prenom = { contains: criteria.prenom, mode: "insensitive" };
    }

    if (criteria.nationalite) {
      where.nationalite = {
        contains: criteria.nationalite,
        mode: "insensitive",
      };
    }

    if (criteria.localisation) {
      where.localisation = {
        contains: criteria.localisation,
        mode: "insensitive",
      };
    }

    if (criteria.age_min !== undefined || criteria.age_max !== undefined) {
      where.age = {};
      if (criteria.age_min !== undefined) {
        where.age.gte = criteria.age_min;
      }
      if (criteria.age_max !== undefined) {
        where.age.lte = criteria.age_max;
      }
    }

    if (criteria.categoryIds && criteria.categoryIds.length > 0) {
      where.categories = {
        some: {
          categorieId: { in: criteria.categoryIds }, // ← Correction ici
        },
      };
    }

    const models = await prisma.model.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        categories: {
          include: {
            categorie: true,
          },
        },
      },
    });

    return models.map((model) => ({
      ...model,
      photo: model.photo === null ? undefined : model.photo,
      categories: model.categories.map((mc) => ({
        ...mc.categorie,
        description:
          mc.categorie.description === null
            ? undefined
            : mc.categorie.description,
      })),
    }));
  }

  static async update(
    id: number,
    modelData: UpdateModelRequest
  ): Promise<Model | null> {
    const { categoryIds, ...data } = modelData;

    // D'abord, supprimer toutes les associations existantes
    await prisma.modelCategorie.deleteMany({
      where: { modelId: id },
    });

    const updatedModel = await prisma.model.update({
      where: { id },
      data: {
        ...data,
        categories:
          categoryIds && categoryIds.length > 0
            ? {
                create: categoryIds.map((categorieId) => ({
                  categorie: { connect: { id: categorieId } },
                })),
              }
            : undefined,
      },
      include: {
        categories: {
          include: {
            categorie: true,
          },
        },
      },
    });

    return {
      ...updatedModel,
      photo: updatedModel.photo ?? undefined,
      categories: updatedModel.categories.map((mc) => ({
        ...mc.categorie,
        description: mc.categorie.description ?? undefined,
      })),
    };
  }

  static async getModelsByCategory(categoryId: number): Promise<Model[]> {
    const models = await prisma.model.findMany({
      where: {
        categories: {
          some: {
            categorieId: categoryId, // Utiliser categorieId au lieu de id
          },
        },
      },
      include: {
        categories: {
          include: {
            categorie: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return models.map((model) => ({
      ...model,
      photo: model.photo === null ? undefined : model.photo,
      categories: model.categories.map((mc) => ({
        ...mc.categorie,
        description:
          mc.categorie.description === null
            ? undefined
            : mc.categorie.description,
      })),
    }));
  }
}
