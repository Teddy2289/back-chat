import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateRegister, validateLogin } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleAuth";

const router = Router();

router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerificationEmail);
router.get("/profile", authenticateToken, AuthController.getProfile);

router.get("/admin/users", authenticateToken, requireAdmin, (req, res) => {
  res.json({ message: "Liste des utilisateurs (admin seulement)" });
});

export default router;
