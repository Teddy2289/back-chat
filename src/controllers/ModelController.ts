// controllers/ModelController.ts
import { Request, Response } from "express";
import { ModelService } from "../services/ModelService";
import {
  createModelSchema,
  updateModelSchema,
  modelSearchSchema,
} from "../validation/schemas";
import {
  handleValidationError,
  validateRequest,
  validateQuery,
} from "../validation/utils";

export class ModelController {
  static async getAllModels(req: Request, res: Response) {
    try {
      const models = await ModelService.findAll();
      res.status(200).json({
        success: true,
        message: "Modèles récupérés avec succès",
        data: models,
        count: models.length,
      });
    } catch (error) {
      console.error("Get all models error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des modèles",
      });
    }
  }

  static async getModelById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const modelId = parseInt(id);

      if (isNaN(modelId) || modelId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID modèle invalide",
        });
      }

      const model = await ModelService.findById(modelId);
      if (!model) {
        return res.status(404).json({
          success: false,
          message: "Modèle non trouvé",
        });
      }

      res.status(200).json({
        success: true,
        message: "Modèle récupéré avec succès",
        data: model,
      });
    } catch (error) {
      console.error("Get model by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du modèle",
      });
    }
  }

  static async createModel(req: Request, res: Response) {
    try {
      // Zod gère maintenant la conversion, plus besoin de parser manuellement
      const modelData = validateRequest(createModelSchema, req);
      const photoFile = req.file as Express.Multer.File | undefined;

      // modelData.categoryIds est maintenant déjà un tableau de nombres (ou undefined)
      const model = await ModelService.create(modelData, photoFile);

      res.status(201).json({
        success: true,
        message: "Modèle créé avec succès",
        data: model,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        // Nettoyer le fichier en cas d'erreur de validation
        if (req.file) {
          // Appeler le service de nettoyage
        }
        return res.status(400).json(validationError);
      }

      console.error("Create model error:", error);
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du modèle",
      });
    }
  }

  static async updateModel(req: Request, res: Response) {
    try {
      console.log(req.body);
      const { id } = req.params;
      const modelId = parseInt(id);

      if (isNaN(modelId) || modelId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID modèle invalide",
        });
      }

      const modelDataRaw = validateRequest(updateModelSchema, req);
      const photoFile = req.file as Express.Multer.File | undefined;

      // Ensure age is a number or undefined
      let categoryIds: number[] | undefined;
      if (req.body.categoryIds) {
        try {
          categoryIds =
            typeof req.body.categoryIds === "string"
              ? JSON.parse(req.body.categoryIds)
              : req.body.categoryIds;
        } catch (e) {
          categoryIds = undefined;
        }
      }

      const modelData = {
        ...modelDataRaw,
        age:
          typeof modelDataRaw.age === "string"
            ? Number(modelDataRaw.age)
            : modelDataRaw.age,
        categoryIds: categoryIds, // Ajouter ici aussi
      };
      const model = await ModelService.update(modelId, modelData, photoFile);
      res.status(200).json({
        success: true,
        message: "Modèle mis à jour avec succès",
        data: model,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update model error:", error);
      if (error instanceof Error) {
        if (error.message.includes("non trouvé")) {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du modèle",
      });
    }
  }

  static async deleteModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const modelId = parseInt(id);

      if (isNaN(modelId) || modelId <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID modèle invalide",
        });
      }

      await ModelService.delete(modelId);
      res.status(200).json({
        success: true,
        message: "Modèle supprimé avec succès",
      });
    } catch (error) {
      console.error("Delete model error:", error);
      if (error instanceof Error) {
        if (error.message.includes("non trouvé")) {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du modèle",
      });
    }
  }

  static async searchModels(req: Request, res: Response) {
    try {
      const criteria = validateQuery(modelSearchSchema, req);
      const models = await ModelService.search(criteria);

      res.status(200).json({
        success: true,
        message: "Recherche de modèles effectuée avec succès",
        data: models,
        count: models.length,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Search models error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la recherche des modèles",
      });
    }
  }

  // controllers/ModelController.ts - Ajoutez cette méthode
  static async getModelsByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const id = parseInt(categoryId);

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID catégorie invalide",
        });
      }

      const models = await ModelService.filterByCategory(id);

      res.status(200).json({
        success: true,
        message: "Modèles filtrés par catégorie avec succès",
        data: models,
        count: models.length,
      });
    } catch (error) {
      console.error("Get models by category error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du filtrage des modèles par catégorie",
      });
    }
  }
}
