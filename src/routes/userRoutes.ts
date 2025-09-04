import express from "express";
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/roleAuth";

const router = express.Router();

// Routes publiques
router.get("/profile", authenticateToken, UserController.getProfile);
router.put("/profile", authenticateToken, UserController.updateProfile);

// Routes admin (protégées par authentification et rôle admin)
router.get("/", authenticateToken, requireAdmin, UserController.getAllUsers);
router.get(
  "/search",
  authenticateToken,
  requireAdmin,
  UserController.searchUsers
);
router.get("/:id", authenticateToken, requireAdmin, UserController.getUserById);
router.post("/", authenticateToken, requireAdmin, UserController.createUser);
router.put("/:id", authenticateToken, requireAdmin, UserController.updateUser);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  UserController.deleteUser
);

export default router;
