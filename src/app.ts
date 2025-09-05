import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import photoRoutes from "./routes/photoRoutes";
import userRoutes from "./routes/userRoutes";
import modelRoutes from "./routes/modelRoutes";
import settingsRoutes from "./routes/settingsRoutes";

dotenv.config();

const app = express();

// Middleware

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/models",modelRoutes);
app.use("/api/settings", settingsRoutes);


app.use("/uploads", express.static("uploads"));
// Route de santé
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Serveur en fonctionnement" });
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
  // Gestion spécifique pour les erreurs JWT
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
  });
});

export default app;
