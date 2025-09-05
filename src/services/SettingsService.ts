import { SettingsModel } from "../models/SettingsModel";
import {
    SiteSettings,
    SettingsSection,
    GeneralSettings,
    LogoSettings,
    HomeSettings,
    GallerySettings,
    AboutSettings
} from "../types";
import { ModelService } from "./ModelService";

export class SettingsService {
    /**
     * Récupère tous les paramètres
     */
    static async getAllSettings(): Promise<SiteSettings[]> {
        try {
            return await SettingsModel.findAll();
        } catch (error) {
            console.error("Error fetching settings:", error);
            throw new Error("Erreur lors de la récupération des paramètres");
        }
    }

    /**
     * Récupère les paramètres d'une section spécifique
     */
    static async getSectionSettings(section: SettingsSection): Promise<SiteSettings | null> {
        try {
            return await SettingsModel.findBySection(section);
        } catch (error) {
            console.error(`Error fetching ${section} settings:`, error);
            throw new Error(`Erreur lors de la récupération des paramètres ${section}`);
        }
    }

    /**
     * Met à jour les paramètres généraux
     */
    static async updateGeneralSettings(settings: GeneralSettings): Promise<SiteSettings> {
        try {
            return await SettingsModel.upsert('general', settings);
        } catch (error) {
            console.error("Error updating general settings:", error);
            throw new Error("Erreur lors de la mise à jour des paramètres généraux");
        }
    }

    /**
     * Met à jour les paramètres du logo
     */
    static async updateLogoSettings(settings: LogoSettings): Promise<SiteSettings> {
        try {
            // Validation
            if (settings.logo_type === 'image' && !settings.logo_image) {
                throw new Error("Une image de logo est requise lorsque le type est 'image'");
            }
            if (settings.logo_type === 'text' && !settings.logo_text) {
                throw new Error("Un texte de logo est requis lorsque le type est 'text'");
            }

            return await SettingsModel.upsert('logo', settings);
        } catch (error) {
            console.error("Error updating logo settings:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur lors de la mise à jour des paramètres du logo");
        }
    }

    /**
     * Met à jour les paramètres de la page d'accueil
     */
    static async updateHomeSettings(settings: HomeSettings): Promise<SiteSettings> {
        try {
            // Validation des slides
            if (settings.slides) {
                for (const slide of settings.slides) {
                    if (slide.is_active && (!slide.image || !slide.title)) {
                        throw new Error("Les slides actives doivent avoir une image et un titre");
                    }
                }
            }

            return await SettingsModel.upsert('home', settings);
        } catch (error) {
            console.error("Error updating home settings:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur lors de la mise à jour des paramètres de l'accueil");
        }
    }

    /**
     * Met à jour les paramètres de la galerie
     */
    static async updateGallerySettings(settings: GallerySettings): Promise<SiteSettings> {
        try {
            if (settings.items_per_page && (settings.items_per_page < 1 || settings.items_per_page > 100)) {
                throw new Error("Le nombre d'items par page doit être entre 1 et 100");
            }

            return await SettingsModel.upsert('gallery', settings);
        } catch (error) {
            console.error("Error updating gallery settings:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur lors de la mise à jour des paramètres de la galerie");
        }
    }

    /**
     * Met à jour les paramètres de la section à propos
     */
    static async updateAboutSettings(settings: AboutSettings): Promise<SiteSettings> {
        try {
            // Vérifier si le modèle existe
            if (settings.selected_model_id) {
                const model = await ModelService.findById(settings.selected_model_id);
                if (!model) {
                    throw new Error("Le modèle sélectionné n'existe pas");
                }
            }

            return await SettingsModel.upsert('about', settings);
        } catch (error) {
            console.error("Error updating about settings:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Erreur lors de la mise à jour des paramètres À propos");
        }
    }

    /**
     * Active/désactive une section
     */
    static async toggleSection(section: SettingsSection, isActive: boolean): Promise<boolean> {
        try {
            return await SettingsModel.toggleSection(section, isActive);
        } catch (error) {
            console.error(`Error toggling ${section} section:`, error);
            throw new Error(`Erreur lors de l'activation/désactivation de la section ${section}`);
        }
    }

    /**
     * Récupère les paramètres sous forme d'objet pratique pour le frontend
     */
    static async getFrontendSettings(): Promise<Record<string, any>> {
        try {
            const allSettings = await this.getAllSettings();
            const result: Record<string, any> = {};

            for (const setting of allSettings) {
                if (setting.is_active) {
                    // Cas spécial pour la section À propos
                    if (setting.section === 'about') {
                        const aboutSettings = setting.settings as AboutSettings;
                        const frontendAbout: any = {
                            about_title: aboutSettings.about_title,
                            show_custom_content: aboutSettings.show_custom_content,
                            custom_content: aboutSettings.custom_content
                        };

                        // Récupérer les données du modèle si un ID est spécifié
                        if (aboutSettings.selected_model_id) {
                            const model = await ModelService.findById(aboutSettings.selected_model_id);
                            if (model) {
                                frontendAbout.model = model;
                            }
                        }

                        result.about = frontendAbout;
                    } else {
                        result[setting.section] = setting.settings;
                    }
                }
            }

            return result;
        } catch (error) {
            console.error("Error getting frontend settings:", error);
            throw new Error("Erreur lors de la récupération des paramètres pour le frontend");
        }
    }
}