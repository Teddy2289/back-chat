import { Router } from "express";
import { PhotoController } from "../controllers/photoController";
import { validatePhoto, checkFileSize } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleAuth";
import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

// Configuration améliorée de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "photo-" + uniqueSuffix + ext);
  },
});

// Filtre pour n'accepter que les images
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1, // Maximum 1 fichier
  },
});

const router = Router();

// Routes publiques
router.get("/", PhotoController.getAllPhotos);
router.get("/:id", PhotoController.getPhoto);
router.post("/:id/like", PhotoController.likePhoto);

// Routes protégées (admin seulement)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  upload.single("image"), // multer d'abord
  (req: Request, res: Response, next: NextFunction) => {
    // console.log("Champs reçus:", req.body);
    next();
  },
  checkFileSize,
  validatePhoto,
  PhotoController.createPhoto
);

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  upload.single("image"),
  checkFileSize,
  validatePhoto,
  PhotoController.updatePhoto
);

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  PhotoController.deletePhoto
);

export default router;
