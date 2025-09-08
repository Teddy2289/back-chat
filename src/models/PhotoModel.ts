// models/PhotoModel.ts
import prisma from "../config/prisma";
import { Photo } from "../types";

export class PhotoModel {
  private static convertTags(tags: any): string[] {
    if (Array.isArray(tags)) {
      return tags.filter((tag) => typeof tag === "string");
    }
    return [];
  }
  static async findAll(): Promise<Photo[]> {
    const photos = await prisma.photo.findMany({
      orderBy: { created_at: "desc" },
    });

    return photos.map((photo) => ({
      ...photo,
      tags: this.convertTags(photo.tags),
    }));
  }
  static async findById(id: number): Promise<Photo | null> {
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    return photo
      ? {
          ...photo,
          tags: this.convertTags(photo.tags),
        }
      : null;
  }

  static async create(
    photoData: Omit<Photo, "id" | "created_at" | "updated_at" | "likes">
  ): Promise<Photo> {
    const photo = await prisma.photo.create({
      data: {
        url: photoData.url,
        alt: photoData.alt,
        tags: photoData.tags, // Prisma gère automatiquement la conversion
        likes: 0,
      },
    });

    return {
      ...photo,
      tags: this.convertTags(photo.tags),
    };
  }
  static async update(
    id: number,
    photoData: Partial<Photo>
  ): Promise<Photo | null> {
    const photo = await prisma.photo.update({
      where: { id },
      data: photoData,
    });

    return photo
      ? {
          ...photo,
          tags: this.convertTags(photo.tags),
        }
      : null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await prisma.photo.delete({
      where: { id },
    });
    return result !== null;
  }

  static async incrementLikes(id: number): Promise<Photo | null> {
    const photo = await prisma.photo.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return photo
      ? {
          ...photo,
          tags: this.convertTags(photo.tags),
        }
      : null;
  }

  static async findByTag(tag: string): Promise<Photo[]> {
    const photos = await prisma.photo.findMany({
      where: {
        tags: {
          array_contains: tag,
        },
      },
      orderBy: { created_at: "desc" },
    });

    return photos.map((photo) => ({
      ...photo,
      tags: this.convertTags(photo.tags),
    }));
  }
}
