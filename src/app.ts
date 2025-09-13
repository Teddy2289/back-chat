import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import photoRoutes from "./routes/photoRoutes";
import userRoutes from "./routes/userRoutes";
import modelRoutes from "./routes/modelRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import categorieRoutes from "./routes/categorieRoutes";
import aiRoutes from "./routes/aiRoutes"; // ← Ajoutez cette importation

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/ai", aiRoutes); // ← Ajoutez cette ligne

app.use("/uploads", express.static("uploads"));

// Route de santé
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Serveur en fonctionnement",
    timestamp: new Date().toISOString()
  });
});

// Gestion des routes non trouvées
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
  });
});

// Gestion des erreurs globales
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", error);

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token JWT invalide",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token JWT expiré",
    });
  }

  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === "development" ? error.message : undefined
  });
});

export default app;