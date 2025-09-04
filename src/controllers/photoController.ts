import { Request, Response } from "express";
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
      const result = await PhotoService.getPhoto(parseInt(id));

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
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
      // Gérer l'upload de fichier ici (le fichier sera dans req.file si vous utilisez multer)
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.url;

      const photoData = {
        url: fileUrl,
        alt: req.body.alt,
        tags: JSON.parse(req.body.tags || "[]"),
      };

      const result = await PhotoService.createPhoto(photoData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
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
      const updateData = { ...req.body };

      // Si des tags sont fournis, les parser
      if (updateData.tags) {
        updateData.tags = JSON.parse(updateData.tags);
      }

      // Gérer l'upload de fichier si fourni
      if (req.file) {
        updateData.url = `/uploads/${req.file.filename}`;
      }

      const result = await PhotoService.updatePhoto(parseInt(id), updateData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
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
      const result = await PhotoService.deletePhoto(parseInt(id));

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
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
      const result = await PhotoService.likePhoto(parseInt(id));

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Like photo error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du like de la photo",
      });
    }
  }
}
