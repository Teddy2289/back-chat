import express from "express";
import { SettingsController } from "../controllers/SettingsController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleAuth";

const router = express.Router();

// ✅ Route publique - Paramètres pour le frontend
router.get("/frontend", SettingsController.getFrontendSettings);

// 🔒 Routes protégées admin
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  SettingsController.getAllSettings
);
router.get(
  "/:section",
  authenticateToken,
  requireAdmin,
  SettingsController.getSectionSettings
);

// Mise à jour des sections spécifiques
router.put(
  "/general",
  authenticateToken,
  requireAdmin,
  SettingsController.updateGeneralSettings
);

router.get(
  "/general/associated-model",
  authenticateToken,
  requireAdmin,
  SettingsController.getAssociatedModel
);

router.put(
  "/logo",
  authenticateToken,
  requireAdmin,
  SettingsController.updateLogoSettings
);
router.put(
  "/home",
  authenticateToken,
  requireAdmin,
  SettingsController.updateHomeSettings
);
router.put(
  "/gallery",
  authenticateToken,
  requireAdmin,
  SettingsController.updateGallerySettings
);
router.put(
  "/about",
  authenticateToken,
  requireAdmin,
  SettingsController.updateAboutSettings
);

// Activation/désactivation des sections
router.patch(
  "/:section/toggle",
  authenticateToken,
  requireAdmin,
  SettingsController.toggleSection
);

export default router;
