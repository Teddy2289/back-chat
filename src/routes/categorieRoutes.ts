// routes/categorieRoutes.ts
import express from "express";
import { CategorieController } from "../controllers/CategorieController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleAuth";

const router = express.Router();

// Routes publiques
router.get("/", CategorieController.getAllCategories);
router.get("/:id", CategorieController.getCategoryById);
router.get("/slug/:slug", CategorieController.getCategoryBySlug);

// Routes protégées admin
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  CategorieController.createCategory
);
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  CategorieController.updateCategory
);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  CategorieController.deleteCategory
);

// Gestion des modèles dans les catégories
router.post(
  "/:categoryId/models/:modelId",
  authenticateToken,
  requireAdmin,
  CategorieController.addModelToCategory
);
router.delete(
  "/:categoryId/models/:modelId",
  authenticateToken,
  requireAdmin,
  CategorieController.removeModelFromCategory
);

export default router;
