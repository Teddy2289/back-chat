import pool from "../config/database";
import { SiteSettings, SettingsSection } from "../types";

export class SettingsModel {
    /**
     * Récupère tous les paramètres
     */
    static async findAll(): Promise<SiteSettings[]> {
        try {
            const [rows] = await pool.execute("SELECT * FROM site_settings ORDER BY section");
            const settings = rows as SiteSettings[];

            // Parse les settings JSON
            return settings.map(setting => ({
                ...setting,
                settings: typeof setting.settings === 'string'
                    ? JSON.parse(setting.settings)
                    : setting.settings
            }));
        } catch (error) {
            console.error("Error in SettingsModel.findAll:", error);
            throw error;
        }
    }

    /**
     * Récupère les paramètres d'une section spécifique
     */
    static async findBySection(section: SettingsSection): Promise<SiteSettings | null> {
        try {
            const [rows] = await pool.execute(
                "SELECT * FROM site_settings WHERE section = ?",
                [section]
            );

            const settings = rows as SiteSettings[];

            if (settings.length === 0) {
                return null;
            }

            // Parse les settings JSON
            return {
                ...settings[0],
                settings: typeof settings[0].settings === 'string'
                    ? JSON.parse(settings[0].settings)
                    : settings[0].settings
            };
        } catch (error) {
            console.error(`Error in SettingsModel.findBySection for ${section}:`, error);
            throw error;
        }
    }

    /**
     * Crée ou met à jour les paramètres d'une section
     */
    static async upsert(
        section: SettingsSection,
        settingsData: Record<string, any>,
        isActive: boolean = true
    ): Promise<SiteSettings> {
        try {
            // Vérifier si la section existe déjà
            const existing = await this.findBySection(section);

            if (existing) {
                // Mise à jour
                const [result] = await pool.execute(
                    `UPDATE site_settings 
           SET settings = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE section = ?`,
                    [JSON.stringify(settingsData), isActive, section]
                );
            } else {
                // Création
                const [result] = await pool.execute(
                    `INSERT INTO site_settings (section, settings, is_active) 
           VALUES (?, ?, ?)`,
                    [section, JSON.stringify(settingsData), isActive]
                );
            }

            // Retourner les settings mis à jour
            const updatedSettings = await this.findBySection(section);
            if (!updatedSettings) {
                throw new Error(`Erreur lors de la création/mise à jour de la section ${section}`);
            }

            return updatedSettings;
        } catch (error) {
            console.error(`Error in SettingsModel.upsert for ${section}:`, error);
            throw error;
        }
    }

    /**
     * Active/désactive une section
     */
    static async toggleSection(section: SettingsSection, isActive: boolean): Promise<boolean> {
        try {
            const [result] = await pool.execute(
                `UPDATE site_settings 
         SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE section = ?`,
                [isActive, section]
            );

            const updateResult = result as any;
            return updateResult.affectedRows > 0;
        } catch (error) {
            console.error(`Error in SettingsModel.toggleSection for ${section}:`, error);
            throw error;
        }
    }

    /**
     * Supprime une section
     */
    static async deleteSection(section: SettingsSection): Promise<boolean> {
        try {
            const [result] = await pool.execute(
                "DELETE FROM site_settings WHERE section = ?",
                [section]
            );

            const deleteResult = result as any;
            return deleteResult.affectedRows > 0;
        } catch (error) {
            console.error(`Error in SettingsModel.deleteSection for ${section}:`, error);
            throw error;
        }
    }

    /**
     * Initialise les paramètres par défaut si la table est vide
     */
    static async initializeDefaultSettings(): Promise<void> {
        try {
            const [rows] = await pool.execute("SELECT COUNT(*) as count FROM site_settings");
            const count = (rows as any)[0].count;

            if (count === 0) {
                console.log("Initialisation des paramètres par défaut...");

                const defaultSettings = [
                    {
                        section: 'general',
                        settings: {
                            site_title: "Mon Site",
                            site_subtitle: "Sous-titre du site",
                            social_title: "Suivez-nous",
                            facebook_url: "",
                            twitter_url: "",
                            instagram_url: "",
                            linkedin_url: "",
                            youtube_url: ""
                        },
                        is_active: true
                    },
                    {
                        section: 'logo',
                        settings: {
                            logo_type: "text",
                            logo_text: "MonLogo",
                            logo_slogan: "Votre slogan ici",
                            logo_image: ""
                        },
                        is_active: true
                    },
                    {
                        section: 'home',
                        settings: {
                            main_title: "Bienvenue",
                            main_subtitle: "Sous-titre d'accueil",
                            show_social_in_hero: true,
                            slides: []
                        },
                        is_active: true
                    },
                    {
                        section: 'gallery',
                        settings: {
                            gallery_title: "Galerie",
                            gallery_subtitle: "Découvrez nos modèles",
                            show_gallery: true,
                            items_per_page: 12
                        },
                        is_active: true
                    },
                    {
                        section: 'about',
                        settings: {
                            about_title: "À propos",
                            selected_model_id: null,
                            show_custom_content: false,
                            custom_content: ""
                        },
                        is_active: true
                    }
                ];

                for (const setting of defaultSettings) {
                    await pool.execute(
                        `INSERT INTO site_settings (section, settings, is_active) 
             VALUES (?, ?, ?)`,
                        [setting.section, JSON.stringify(setting.settings), setting.is_active]
                    );
                }

                console.log("Paramètres par défaut initialisés avec succès");
            }
        } catch (error) {
            console.error("Error initializing default settings:", error);
            throw error;
        }
    }

    /**
     * Vérifie si une section existe
     */
    static async sectionExists(section: SettingsSection): Promise<boolean> {
        try {
            const [rows] = await pool.execute(
                "SELECT COUNT(*) as count FROM site_settings WHERE section = ?",
                [section]
            );

            const count = (rows as any)[0].count;
            return count > 0;
        } catch (error) {
            console.error(`Error checking if section ${section} exists:`, error);
            throw error;
        }
    }

    /**
     * Récupère seulement les sections activées
     */
    static async findActiveSections(): Promise<SiteSettings[]> {
        try {
            const [rows] = await pool.execute(
                "SELECT * FROM site_settings WHERE is_active = true ORDER BY section"
            );

            const settings = rows as SiteSettings[];

            // Parse les settings JSON
            return settings.map(setting => ({
                ...setting,
                settings: typeof setting.settings === 'string'
                    ? JSON.parse(setting.settings)
                    : setting.settings
            }));
        } catch (error) {
            console.error("Error in SettingsModel.findActiveSections:", error);
            throw error;
        }
    }
}