// models/ModelModel.ts
import prisma from "../config/prisma";
import { Model, CreateModelRequest, UpdateModelRequest } from "../types";

export class ModelModel {
  static async create(modelData: CreateModelRequest): Promise<Model> {
    return await prisma.model.create({
      data: modelData,
    });
  }

  static async findById(id: number): Promise<Model | null> {
    return await prisma.model.findUnique({
      where: { id },
    });
  }

  static async findAll(): Promise<Model[]> {
    return await prisma.model.findMany({
      orderBy: { created_at: "desc" },
    });
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
  }): Promise<Model[]> {
    const where: any = {};

    if (criteria.prenom) {
      where.prenom = { contains: criteria.prenom };
    }

    if (criteria.nationalite) {
      where.nationalite = { contains: criteria.nationalite };
    }

    if (criteria.localisation) {
      where.localisation = { contains: criteria.localisation };
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

    return await prisma.model.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  static async update(
    id: number,
    modelData: UpdateModelRequest
  ): Promise<Model | null> {
    return await prisma.model.update({
      where: { id },
      data: modelData,
    });
  }
}
