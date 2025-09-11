// controllers/CategorieController.ts
import { Request, Response } from "express";
import { CategorieService } from "../services/CategorieService";
import { CreateCategorieRequest, UpdateCategorieRequest } from "../types";

export class CategorieController {
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await CategorieService.findAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur serveur",
      });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
      }

      const category = await CategorieService.findById(id);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Catégorie non trouvée" });
      }

      res.json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur serveur",
      });
    }
  }

  static async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const category = await CategorieService.findBySlug(slug);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Catégorie non trouvée" });
      }

      res.json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur serveur",
      });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const categoryData: CreateCategorieRequest = req.body;
      const category = await CategorieService.create(categoryData);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur de création",
      });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
      }

      const categoryData: UpdateCategorieRequest = req.body;
      const category = await CategorieService.update(id, categoryData);
      res.json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Erreur de mise à jour",
      });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "ID invalide" });
      }

      const success = await CategorieService.delete(id);
      res.json({ success, message: "Catégorie supprimée avec succès" });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Erreur de suppression",
      });
    }
  }

  static async addModelToCategory(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const modelId = parseInt(req.params.modelId);

      if (isNaN(categoryId) || isNaN(modelId)) {
        return res
          .status(400)
          .json({ success: false, message: "IDs invalides" });
      }

      await CategorieService.addModelToCategory(categoryId, modelId);
      res.json({ success: true, message: "Modèle ajouté à la catégorie" });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Erreur lors de l'ajout",
      });
    }
  }

  static async removeModelFromCategory(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const modelId = parseInt(req.params.modelId);

      if (isNaN(categoryId) || isNaN(modelId)) {
        return res
          .status(400)
          .json({ success: false, message: "IDs invalides" });
      }

      await CategorieService.removeModelFromCategory(categoryId, modelId);
      res.json({ success: true, message: "Modèle retiré de la catégorie" });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Erreur lors du retrait",
      });
    }
  }
}
