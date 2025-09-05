import express from "express";
import { ModelController } from "../controllers/ModelController";
import upload from "../config/multer.ts";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleAuth";
import multer from "multer";

const router = express.Router();

// Middleware wrapper pour gérer les erreurs Multer
const handleUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: "Le fichier est trop volumineux (max 10MB)"
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Erreur d'upload: ${err.message}`
                });
            } else if (err instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            return res.status(400).json({
                success: false,
                message: "Erreur lors de l'upload du fichier"
            });
        }
        next();
    });
};

// Routes publiques
router.get("/", ModelController.getAllModels);
router.get("/search", ModelController.searchModels);
router.get("/:id", ModelController.getModelById);

// Routes avec upload de fichier
router.post("/", handleUpload, ModelController.createModel);
router.put("/:id", handleUpload, ModelController.updateModel);

// Routes protégées (si nécessaire)
router.delete("/:id", authenticateToken, requireAdmin, ModelController.deleteModel);

export default router;