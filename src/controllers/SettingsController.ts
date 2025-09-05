import { Request, Response } from "express";
import { SettingsService } from "../services/SettingsService";
import {
    SettingsSection,
    GeneralSettings,
    LogoSettings,
    HomeSettings,
    GallerySettings,
    AboutSettings
} from "../types";

export class SettingsController {
    /**
     * Récupère tous les paramètres (admin)
     */
    static async getAllSettings(req: Request, res: Response) {
        try {
            const settings = await SettingsService.getAllSettings();

            res.status(200).json({
                success: true,
                message: "Paramètres récupérés avec succès",
                data: settings,
                count: settings.length,
            });
        } catch (error) {
            console.error("Get all settings error:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des paramètres",
            });
        }
    }

    /**
     * Récupère les paramètres d'une section spécifique (admin)
     */
    static async getSectionSettings(req: Request, res: Response) {
        try {
            const { section } = req.params;

            if (!['general', 'logo', 'home', 'gallery', 'about'].includes(section)) {
                return res.status(400).json({
                    success: false,
                    message: "Section invalide. Options: general, logo, home, gallery, about",
                });
            }

            const settings = await SettingsService.getSectionSettings(section as SettingsSection);

            if (!settings) {
                return res.status(404).json({
                    success: false,
                    message: "Paramètres de section non trouvés",
                });
            }

            res.status(200).json({
                success: true,
                message: "Paramètres de section récupérés avec succès",
                data: settings,
            });
        } catch (error) {
            console.error("Get section settings error:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des paramètres de section",
            });
        }
    }

    /**
     * Met à jour les paramètres généraux
     */
    static async updateGeneralSettings(req: Request, res: Response) {
        try {
            const settings: GeneralSettings = req.body;

            if (!settings.site_title) {
                return res.status(400).json({
                    success: false,
                    message: "Le titre du site est obligatoire",
                });
            }

            const updatedSettings = await SettingsService.updateGeneralSettings(settings);

            res.status(200).json({
                success: true,
                message: "Paramètres généraux mis à jour avec succès",
                data: updatedSettings,
            });
        } catch (error) {
            console.error("Update general settings error:", error);

            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour des paramètres généraux",
            });
        }
    }

    /**
     * Met à jour les paramètres du logo
     */
    static async updateLogoSettings(req: Request, res: Response) {
        try {
            const settings: LogoSettings = req.body;

            const updatedSettings = await SettingsService.updateLogoSettings(settings);

            res.status(200).json({
                success: true,
                message: "Paramètres du logo mis à jour avec succès",
                data: updatedSettings,
            });
        } catch (error) {
            console.error("Update logo settings error:", error);

            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour des paramètres du logo",
            });
        }
    }

    /**
     * Met à jour les paramètres de l'accueil
     */
    static async updateHomeSettings(req: Request, res: Response) {
        try {
            const settings: HomeSettings = req.body;

            const updatedSettings = await SettingsService.updateHomeSettings(settings);

            res.status(200).json({
                success: true,
                message: "Paramètres de l'accueil mis à jour avec succès",
                data: updatedSettings,
            });
        } catch (error) {
            console.error("Update home settings error:", error);

            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour des paramètres de l'accueil",
            });
        }
    }

    /**
     * Met à jour les paramètres de la galerie
     */
    static async updateGallerySettings(req: Request, res: Response) {
        try {
            const settings: GallerySettings = req.body;

            const updatedSettings = await SettingsService.updateGallerySettings(settings);

            res.status(200).json({
                success: true,
                message: "Paramètres de la galerie mis à jour avec succès",
                data: updatedSettings,
            });
        } catch (error) {
            console.error("Update gallery settings error:", error);

            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour des paramètres de la galerie",
            });
        }
    }

    /**
     * Met à jour les paramètres À propos
     */
    static async updateAboutSettings(req: Request, res: Response) {
        try {
            const settings: AboutSettings = req.body;

            const updatedSettings = await SettingsService.updateAboutSettings(settings);

            res.status(200).json({
                success: true,
                message: "Paramètres À propos mis à jour avec succès",
                data: updatedSettings,
            });
        } catch (error) {
            console.error("Update about settings error:", error);

            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour des paramètres À propos",
            });
        }
    }

    /**
     * Active/désactive une section
     */
    static async toggleSection(req: Request, res: Response) {
        try {
            const { section } = req.params;
            const { is_active } = req.body;

            if (!['general', 'logo', 'home', 'gallery', 'about'].includes(section)) {
                return res.status(400).json({
                    success: false,
                    message: "Section invalide. Options: general, logo, home, gallery, about",
                });
            }

            if (typeof is_active !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: "Le champ is_active doit être un booléen",
                });
            }

            const success = await SettingsService.toggleSection(section as SettingsSection, is_active);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Section non trouvée",
                });
            }

            res.status(200).json({
                success: true,
                message: `Section ${section} ${is_active ? 'activée' : 'désactivée'} avec succès`,
            });
        } catch (error) {
            console.error("Toggle section error:", error);

            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: "Erreur lors de l'activation/désactivation de la section",
            });
        }
    }

    /**
     * Récupère les paramètres pour le frontend (public)
     */
    static async getFrontendSettings(req: Request, res: Response) {
        try {
            const settings = await SettingsService.getFrontendSettings();

            res.status(200).json({
                success: true,
                message: "Paramètres frontend récupérés avec succès",
                data: settings,
            });
        } catch (error) {
            console.error("Get frontend settings error:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des paramètres frontend",
            });
        }
    }
}