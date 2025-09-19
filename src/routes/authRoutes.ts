// routes/auth.ts
import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateRegister, validateLogin } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import {
  requireAdmin,
  requireAgentOrAdmin,
  requireAuth,
  requireClient,
  requireRole,
  requireUser,
  requireVerified,
} from "../middleware/roleAuth";
import { UserType } from "../generated/prisma";

const router = Router();

// Routes publiques
router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerificationEmail);

// Route accessible à TOUS les utilisateurs authentifiés
router.get("/profile", authenticateToken, AuthController.getProfile);

// Routes spécifiques pour chaque type d'utilisateur

// Admin seulement
router.get("/admin/users", authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Liste des utilisateurs (admin seulement)",
    data: [],
  });
});

// Agent ou Admin
router.get(
  "/agent/conversations",
  authenticateToken,
  requireAgentOrAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: "Conversations des agents",
      data: [],
    });
  }
);

// Client seulement
router.get(
  "/client/dashboard",
  authenticateToken,
  requireClient,
  (req, res) => {
    res.json({
      success: true,
      message: "Dashboard client",
      data: { user: req.user },
    });
  }
);

// User seulement
router.get("/user/profile", authenticateToken, requireUser, (req, res) => {
  res.json({
    success: true,
    message: "Profil utilisateur standard",
    data: { user: req.user },
  });
});

// Tous les utilisateurs vérifiés
router.get(
  "/premium/content",
  authenticateToken,
  requireVerified,
  (req, res) => {
    res.json({
      success: true,
      message: "Contenu premium",
      data: {},
    });
  }
);

// Route mixte pour plusieurs types
router.get(
  "/shared/content",
  authenticateToken,
  requireRole([UserType.Admin, UserType.Agent, UserType.Client]),
  (req, res) => {
    res.json({
      success: true,
      message: "Contenu partagé",
      data: {},
    });
  }
);

export default router;
