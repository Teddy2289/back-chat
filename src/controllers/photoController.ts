// controllers/PhotoController.ts
import { Request, Response } from "express";
import { createPhotoSchema, updatePhotoSchema } from "../validation/schemas";
import { handleValidationError, validateData } from "../validation/utils";
import { PhotoService } from "../services/photoService";

export class PhotoController {
  static async getAllPhotos(req: Request, res: Response) {
    try {
      const { tag } = req.query;
      const result = await PhotoService.getAllPhotos(tag as string);
      res.status(200).json(result);
    } catch (error) {
      console.error("Get all photos error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des photos",
      });
    }
  }

  static async getPhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const photoId = parseInt(id);

      if (isNaN(photoId) || photoId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID photo invalide",
        });
      }

      const result = await PhotoService.getPhoto(photoId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error("Get photo error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de la photo",
      });
    }
  }

  static async createPhoto(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Fichier image requis",
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      // Gestion des tags
      let tags: string[] = [];
      if (req.body.tags) {
        try {
          tags =
            typeof req.body.tags === "string"
              ? JSON.parse(req.body.tags)
              : req.body.tags;
        } catch (e) {
          tags = [];
        }
      }

      // Utilisez validateData au lieu de validateRequest
      const validatedData = validateData(createPhotoSchema, {
        alt: req.body.alt,
        tags: tags,
        url: fileUrl, // N'OUBLIEZ PAS L'URL
      });

      const result = await PhotoService.createPhoto(validatedData);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Create photo error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création de la photo",
      });
    }
  }

  static async updatePhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const photoId = parseInt(id);

      if (isNaN(photoId) || photoId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID photo invalide",
        });
      }

      const updateData: any = { ...req.body };

      // Gestion du fichier
      if (req.file) {
        updateData.url = `/uploads/${req.file.filename}`;
      }

      // Gestion des tags
      if (updateData.tags) {
        try {
          updateData.tags =
            typeof updateData.tags === "string"
              ? JSON.parse(updateData.tags)
              : updateData.tags;
        } catch (e) {
          // Garder les tags tels quels si le parsing échoue
        }
      }

      // Utilisez validateData ici aussi
      const validatedData = validateData(updatePhotoSchema, updateData);
      const result = await PhotoService.updatePhoto(photoId, validatedData);

      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update photo error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de la photo",
      });
    }
  }
  static async deletePhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const photoId = parseInt(id);

      if (isNaN(photoId) || photoId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID photo invalide",
        });
      }

      const result = await PhotoService.deletePhoto(photoId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error("Delete photo error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de la photo",
      });
    }
  }

  static async likePhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const photoId = parseInt(id);

      if (isNaN(photoId) || photoId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID photo invalide",
        });
      }

      const result = await PhotoService.likePhoto(photoId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error("Like photo error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du like de la photo",
      });
    }
  }
}
