import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
  url: string;
  fileName: string;
  filePath: string;
}

// Créer le dossier d'upload s'il n'existe pas
const uploadDir = path.join(process.cwd(), "uploads", "chat");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadFileLocal = async (
  file: Express.Multer.File
): Promise<UploadResult> => {
  try {
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Écrire le fichier sur le disque
    fs.writeFileSync(filePath, file.buffer);

    // Générer l'URL d'accès (à adapter selon votre configuration)
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const fileUrl = `${baseUrl}/uploads/chat/${uniqueFileName}`;

    return {
      url: fileUrl,
      fileName: file.originalname,
      filePath: filePath,
    };
  } catch (error) {
    console.error("Error uploading file locally:", error);
    throw new Error("File upload failed");
  }
};

export const deleteFileLocal = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("File deletion failed");
  }
};

// Servir les fichiers statiques (à ajouter dans votre app.ts)
export const serveUploadedFiles = (app: any) => {
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
};
