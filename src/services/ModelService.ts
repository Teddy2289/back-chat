import { ModelModel } from "../models/ModelModel";
import { Model, CreateModelRequest, UpdateModelRequest } from "../types";
import * as fs from "fs";
import path from "path";

export class ModelService {
    /**
     * Récupère tous les modèles
     */
    static async findAll(): Promise<Model[]> {
        try {
            return await ModelModel.findAll();
        } catch (error) {
            console.error("Error fetching models:", error);
            throw new Error("Erreur lors de la récupération des modèles");
        }
    }

    /**
     * Récupère un modèle par son ID
     */
    static async findById(id: number): Promise<Model | null> {
        try {
            return await ModelModel.findById(id);
        } catch (error) {
            console.error("Error fetching model by ID:", error);
            throw new Error("Erreur lors de la récupération du modèle");
        }
    }

    /**
     * Crée un nouveau modèle avec gestion optionnelle de photo
     */
    static async create(
        modelData: CreateModelRequest,
        photoFile?: Express.Multer.File
    ): Promise<Model> {
        try {
            // Validation des champs requis
            if (!modelData.prenom || !modelData.nationalite) {
                throw new Error("Le prénom et la nationalité sont obligatoires");
            }

            if (modelData.age && (modelData.age < 0 || modelData.age > 150)) {
                throw new Error("L'âge doit être compris entre 0 et 150");
            }

            // Gestion du fichier photo si fourni
            if (photoFile) {
                const photoUrl = await this.processUploadedPhoto(photoFile);
                modelData.photo = photoUrl;
            }

            return await ModelModel.create(modelData);
        } catch (error) {
            // Nettoyer le fichier en cas d'erreur
            if (photoFile) {
                this.cleanupFile(photoFile.path);
            }

            console.error("Error creating model:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur lors de la création du modèle");
        }
    }

    /**
     * Met à jour un modèle avec gestion optionnelle de photo
     */
    static async update(
        id: number,
        modelData: UpdateModelRequest,
        photoFile?: Express.Multer.File
    ): Promise<Model> {
        try {
            // Vérifier si le modèle existe
            const existingModel = await this.findById(id);
            if (!existingModel) {
                throw new Error("Modèle non trouvé");
            }

            // Validation de l'âge si fourni
            if (modelData.age !== undefined && (modelData.age < 0 || modelData.age > 150)) {
                throw new Error("L'âge doit être compris entre 0 et 150");
            }

            // Gestion du fichier photo si fourni
            if (photoFile) {
                // Supprimer l'ancienne photo si elle existe et est stockée localement
                if (existingModel.photo && this.isLocalFile(existingModel.photo)) {
                    this.cleanupFile(this.getFullPath(existingModel.photo));
                }

                // Traiter la nouvelle photo
                const photoUrl = await this.processUploadedPhoto(photoFile);
                modelData.photo = photoUrl;
            }

            const updatedModel = await ModelModel.update(id, modelData);
            if (!updatedModel) {
                throw new Error("Erreur lors de la mise à jour du modèle");
            }

            return updatedModel;
        } catch (error) {
            // Nettoyer le fichier en cas d'erreur
            if (photoFile) {
                this.cleanupFile(photoFile.path);
            }

            console.error("Error updating model:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur lors de la mise à jour du modèle");
        }
    }

    /**
     * Supprime un modèle et sa photo associée
     */
    static async delete(id: number): Promise<boolean> {
        try {
            // Vérifier si le modèle existe
            const existingModel = await this.findById(id);
            if (!existingModel) {
                throw new Error("Modèle non trouvé");
            }

            // Supprimer la photo associée si elle existe et est stockée localement
            if (existingModel.photo && this.isLocalFile(existingModel.photo)) {
                this.cleanupFile(this.getFullPath(existingModel.photo));
            }

            return await ModelModel.delete(id);
        } catch (error) {
            console.error("Error deleting model:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur lors de la suppression du modèle");
        }
    }

    /**
     * Recherche des modèles par critères
     */
    static async search(criteria: {
        prenom?: string;
        nationalite?: string;
        localisation?: string;
        age_min?: number;
        age_max?: number;
    }): Promise<Model[]> {
        try {
            return await ModelModel.search(criteria);
        } catch (error) {
            console.error("Error searching models:", error);
            throw new Error("Erreur lors de la recherche des modèles");
        }
    }

    /**
     * Traite le fichier uploadé
     */
    private static async processUploadedPhoto(file: Express.Multer.File): Promise<string> {
        // Votre configuration Multer enregistre dans "uploads/"
        // et génère des noms comme "photo-1234567890.jpg"
        const publicPath = `/uploads/${file.filename}`;

        return publicPath;
    }

    /**
     * Nettoie les fichiers en cas d'erreur
     */
    private static cleanupFile(filePath: string): void {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error("Error cleaning up file:", error);
        }
    }

    /**
     * Vérifie si le chemin est un fichier local
     */
    private static isLocalFile(filePath: string): boolean {
        return filePath.startsWith('/uploads/');
    }

    /**
     * Obtient le chemin complet du fichier
     */
    private static getFullPath(relativePath: string): string {
        return path.join(process.cwd(), relativePath); // Retirez 'public' du chemin
    }
}