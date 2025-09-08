// services/PhotoService.ts
import { PhotoModel } from "../models/PhotoModel";
import { Photo } from "../types";

interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class PhotoService {
  static async getAllPhotos(tag?: string): Promise<ServiceResponse> {
    try {
      const photos = tag
        ? await PhotoModel.findByTag(tag)
        : await PhotoModel.findAll();

      return {
        success: true,
        message: "Photos récupérées avec succès",
        data: photos,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getPhoto(id: number): Promise<ServiceResponse> {
    try {
      const photo = await PhotoModel.findById(id);

      if (!photo) {
        return {
          success: false,
          message: "Photo non trouvée",
        };
      }

      return {
        success: true,
        message: "Photo récupérée avec succès",
        data: photo,
      };
    } catch (error) {
      throw error;
    }
  }

  static async createPhoto(
    photoData: Omit<Photo, "id" | "created_at" | "updated_at" | "likes">
  ): Promise<ServiceResponse> {
    try {
      const photo = await PhotoModel.create(photoData);

      return {
        success: true,
        message: "Photo créée avec succès",
        data: photo,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updatePhoto(
    id: number,
    photoData: Partial<Photo>
  ): Promise<ServiceResponse> {
    try {
      const existingPhoto = await PhotoModel.findById(id);

      if (!existingPhoto) {
        return {
          success: false,
          message: "Photo non trouvée",
        };
      }

      const updatedPhoto = await PhotoModel.update(id, photoData);

      return {
        success: true,
        message: "Photo mise à jour avec succès",
        data: updatedPhoto,
      };
    } catch (error) {
      throw error;
    }
  }

  static async deletePhoto(id: number): Promise<ServiceResponse> {
    try {
      const existingPhoto = await PhotoModel.findById(id);

      if (!existingPhoto) {
        return {
          success: false,
          message: "Photo non trouvée",
        };
      }

      const isDeleted = await PhotoModel.delete(id);

      if (!isDeleted) {
        return {
          success: false,
          message: "Erreur lors de la suppression de la photo",
        };
      }

      return {
        success: true,
        message: "Photo supprimée avec succès",
      };
    } catch (error) {
      throw error;
    }
  }

  static async likePhoto(id: number): Promise<ServiceResponse> {
    try {
      const existingPhoto = await PhotoModel.findById(id);

      if (!existingPhoto) {
        return {
          success: false,
          message: "Photo non trouvée",
        };
      }

      const updatedPhoto = await PhotoModel.incrementLikes(id);

      return {
        success: true,
        message: "Photo likée avec succès",
        data: updatedPhoto,
      };
    } catch (error) {
      throw error;
    }
  }
}
