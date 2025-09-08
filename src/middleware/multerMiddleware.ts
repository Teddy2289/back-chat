// middleware/multerMiddleware.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";

// Configuration de base de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Détermine le dossier de destination basé sur la route
    const baseDir = "uploads/";
    let subDir = "";

    if (req.originalUrl.includes("/api/models")) {
      subDir = "models/";
    } else if (req.originalUrl.includes("/api/photos")) {
      subDir = "photos/";
    }

    cb(null, baseDir + subDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    // Préfixe basé sur la route
    let prefix = "file-";
    if (req.originalUrl.includes("/api/models")) {
      prefix = "model-";
    } else if (req.originalUrl.includes("/api/photos")) {
      prefix = "photo-";
    }

    cb(null, prefix + uniqueSuffix + ext);
  },
});

const fileFilter = (
  req: Request,
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
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Middleware flexible qui accepte n'importe quel nom de champ fichier
export const handleFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Utilise any() pour accepter n'importe quel nom de champ
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Le fichier est trop volumineux (max 10MB)",
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message: "Champ de fichier inattendu",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Erreur d'upload: ${err.message}`,
        });
      } else if (err instanceof Error) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Erreur lors de l'upload du fichier",
      });
    }

    // Déplace le fichier uploadé vers req.body.photo_url pour uniformité
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const file = req.files[0];
      req.body.photo_url = `/uploads/${file.filename}`;
    }

    next();
  });
};
