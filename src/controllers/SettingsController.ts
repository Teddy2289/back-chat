// controllers/SettingsController.ts
import { Request, Response } from "express";
import { SettingsService } from "../services/SettingsService";
import {
  generalSettingsSchema,
  logoSettingsSchema,
  homeSettingsSchema,
  gallerySettingsSchema,
  aboutSettingsSchema,
  toggleSectionSchema,
} from "../validation/schemas";
import {
  handleValidationError,
  validateRequest,
  validateParams,
} from "../validation/utils";
import { SettingsSection } from "../types";

const VALID_SECTIONS: SettingsSection[] = [
  "general",
  "logo",
  "home",
  "gallery",
  "about",
];

export class SettingsController {
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

  static async getSectionSettings(req: Request, res: Response) {
    try {
      const { section } = req.params;

      if (!VALID_SECTIONS.includes(section as SettingsSection)) {
        return res.status(400).json({
          success: false,
          message: `Section invalide. Options: ${VALID_SECTIONS.join(", ")}`,
        });
      }

      const settings = await SettingsService.getSectionSettings(
        section as SettingsSection
      );
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

  static async updateGeneralSettings(req: Request, res: Response) {
    try {
      const settings = validateRequest(generalSettingsSchema, req);
      const updatedSettings = await SettingsService.updateGeneralSettings(
        settings
      );

      res.status(200).json({
        success: true,
        message: "Paramètres généraux mis à jour avec succès",
        data: updatedSettings,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update general settings error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour des paramètres généraux",
      });
    }
  }

  static async updateLogoSettings(req: Request, res: Response) {
    try {
      const settings = validateRequest(logoSettingsSchema, req);
      const updatedSettings = await SettingsService.updateLogoSettings(
        settings
      );

      res.status(200).json({
        success: true,
        message: "Paramètres du logo mis à jour avec succès",
        data: updatedSettings,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update logo settings error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour des paramètres du logo",
      });
    }
  }

  static async updateHomeSettings(req: Request, res: Response) {
    try {
      const settings = validateRequest(homeSettingsSchema, req);
      const updatedSettings = await SettingsService.updateHomeSettings(
        settings
      );

      res.status(200).json({
        success: true,
        message: "Paramètres de l'accueil mis à jour avec succès",
        data: updatedSettings,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update home settings error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour des paramètres de l'accueil",
      });
    }
  }

  static async updateGallerySettings(req: Request, res: Response) {
    try {
      const settings = validateRequest(gallerySettingsSchema, req);
      const updatedSettings = await SettingsService.updateGallerySettings(
        settings
      );

      res.status(200).json({
        success: true,
        message: "Paramètres de la galerie mis à jour avec succès",
        data: updatedSettings,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update gallery settings error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour des paramètres de la galerie",
      });
    }
  }

  static async updateAboutSettings(req: Request, res: Response) {
    try {
      const settings = validateRequest(aboutSettingsSchema, req);
      const updatedSettings = await SettingsService.updateAboutSettings(
        settings
      );

      res.status(200).json({
        success: true,
        message: "Paramètres À propos mis à jour avec succès",
        data: updatedSettings,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Update about settings error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour des paramètres À propos",
      });
    }
  }

  static async toggleSection(req: Request, res: Response) {
    try {
      const { section } = req.params;

      if (!VALID_SECTIONS.includes(section as SettingsSection)) {
        return res.status(400).json({
          success: false,
          message: `Section invalide. Options: ${VALID_SECTIONS.join(", ")}`,
        });
      }

      const { is_active } = validateRequest(toggleSectionSchema, req);
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

      res.status(200).json({
        success: true,
        message: `Section ${section} ${
          is_active ? "activée" : "désactivée"
        } avec succès`,
      });
    } catch (error) {
      const validationError = handleValidationError(error);
      if (!validationError.success) {
        return res.status(400).json(validationError);
      }

      console.error("Toggle section error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'activation/désactivation de la section",
      });
    }
  }

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
