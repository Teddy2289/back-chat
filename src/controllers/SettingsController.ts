import { Request, Response } from "express";
import { SettingsService } from "../services/SettingsService";
import { SettingsSection } from "../types";

export class SettingsController {
  /**
   * Récupère tous les paramètres (admin)
   */
  static async getAllSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.getAllSettings();
      res.json({
        success: true,
        data: settings,
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

      if (!this.isValidSection(section)) {
        return res.status(400).json({
          success: false,
          message: "Section invalide",
        });
      }

      const settings = await SettingsService.getSectionSettings(
        section as SettingsSection
      );

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "Section non trouvée",
        });
      }

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Get section settings error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des paramètres",
      });
    }
  }

  /**
   * Paramètres pour le frontend (public)
   */
  static async getFrontendSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.getFrontendSettings();
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Get frontend settings error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des paramètres",
      });
    }
  }

  /**
   * Met à jour les paramètres généraux
   */
  static async updateGeneralSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.updateGeneralSettings(req.body);
      res.json({
        success: true,
        message: "Paramètres généraux mis à jour",
        data: settings,
      });
    } catch (error) {
      console.error("Update general settings error:", error);
      this.handleSettingsError(error, res, "généraux");
    }
  }

  /**
   * Met à jour les paramètres du logo
   */
  static async updateLogoSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.updateLogoSettings(req.body);
      res.json({
        success: true,
        message: "Paramètres du logo mis à jour",
        data: settings,
      });
    } catch (error) {
      console.error("Update logo settings error:", error);
      this.handleSettingsError(error, res, "du logo");
    }
  }

  /**
   * Met à jour les paramètres de la page d'accueil
   */
  static async updateHomeSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.updateHomeSettings(req.body);
      res.json({
        success: true,
        message: "Paramètres de l'accueil mis à jour",
        data: settings,
      });
    } catch (error) {
      console.error("Update home settings error:", error);
      this.handleSettingsError(error, res, "de l'accueil");
    }
  }

  /**
   * Met à jour les paramètres de la galerie
   */
  static async updateGallerySettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.updateGallerySettings(req.body);
      res.json({
        success: true,
        message: "Paramètres de la galerie mis à jour",
        data: settings,
      });
    } catch (error) {
      console.error("Update gallery settings error:", error);
      this.handleSettingsError(error, res, "de la galerie");
    }
  }

  /**
   * Met à jour les paramètres À propos
   */
  static async updateAboutSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.updateAboutSettings(req.body);
      res.json({
        success: true,
        message: "Paramètres À propos mis à jour",
        data: settings,
      });
    } catch (error) {
      console.error("Update about settings error:", error);
      this.handleSettingsError(error, res, "À propos");
    }
  }

  /**
   * Active/désactive une section
   */
  static async toggleSection(req: Request, res: Response) {
    try {
      const { section } = req.params;
      const { is_active } = req.body;

      if (!this.isValidSection(section)) {
        return res.status(400).json({
          success: false,
          message: "Section invalide",
        });
      }

      if (typeof is_active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Le champ is_active doit être un booléen",
        });
      }

      const success = await SettingsService.toggleSection(
        section as SettingsSection,
        is_active
      );

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Section non trouvée",
        });
      }

      res.json({
        success: true,
        message: `Section ${section} ${is_active ? "activée" : "désactivée"}`,
      });
    } catch (error) {
      console.error("Toggle section error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modification de la section",
      });
    }
  }

  /**
   * Méthodes utilitaires
   */
  private static isValidSection(section: string): section is SettingsSection {
    return ["general", "logo", "home", "gallery", "about"].includes(section);
  }

  private static handleSettingsError(
    error: any,
    res: Response,
    sectionName: string
  ) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: `Erreur lors de la mise à jour des paramètres ${sectionName}`,
    });
  }
}
