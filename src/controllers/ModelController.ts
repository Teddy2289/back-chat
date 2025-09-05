import { Request, Response } from "express";
import { ModelService } from "../services/ModelService";
import { CreateModelRequest, UpdateModelRequest } from "../types";

export class ModelController {
    /**
     * Récupère tous les modèles
     */
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

    /**
     * Récupère un modèle par son ID
     */
    static async getModelById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: "ID modèle invalide",
                });
            }

            const model = await ModelService.findById(parseInt(id));

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

    /**
     * Crée un nouveau modèle (avec ou sans photo)
     */
    static async createModel(req: Request, res: Response) {
        try {
            const modelData: CreateModelRequest = req.body;
            const photoFile = req.file as Express.Multer.File | undefined;

            // Validation des champs requis
            if (!modelData.prenom || !modelData.nationalite) {
                // Nettoyer le fichier si validation échoue
                if (photoFile) {
                    // Vous pourriez appeler un service de nettoyage ici
                }
                return res.status(400).json({
                    success: false,
                    message: "Le prénom et la nationalité sont obligatoires",
                });
            }

            const model = await ModelService.create(modelData, photoFile);

            res.status(201).json({
                success: true,
                message: "Modèle créé avec succès",
                data: model,
            });
        } catch (error) {
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

    /**
     * Met à jour un modèle (avec ou sans photo)
     */
    static async updateModel(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const modelData: UpdateModelRequest = req.body;
            const photoFile = req.file as Express.Multer.File | undefined;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: "ID modèle invalide",
                });
            }

            const model = await ModelService.update(parseInt(id), modelData, photoFile);

            res.status(200).json({
                success: true,
                message: "Modèle mis à jour avec succès",
                data: model,
            });
        } catch (error) {
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

    /**
     * Supprime un modèle
     */
    static async deleteModel(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: "ID modèle invalide",
                });
            }

            await ModelService.delete(parseInt(id));

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

    /**
     * Recherche des modèles par critères
     */
    static async searchModels(req: Request, res: Response) {
        try {
            const { prenom, nationalite, localisation, age_min, age_max } = req.query;

            // Conversion des paramètres numériques
            let ageMin: number | undefined;
            let ageMax: number | undefined;

            if (age_min) ageMin = parseInt(age_min as string);
            if (age_max) ageMax = parseInt(age_max as string);

            const models = await ModelService.search({
                prenom: prenom as string,
                nationalite: nationalite as string,
                localisation: localisation as string,
                age_min: ageMin,
                age_max: ageMax,
            });

            res.status(200).json({
                success: true,
                message: "Recherche de modèles effectuée avec succès",
                data: models,
                count: models.length,
            });
        } catch (error) {
            console.error("Search models error:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la recherche des modèles",
            });
        }
    }
}