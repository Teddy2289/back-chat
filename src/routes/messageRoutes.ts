// routes/messageRoutes.ts
import express from "express";
import { messageController } from "../controllers/MessageController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.post("/client", authenticateToken, messageController.sendClientMessage);
router.post("/model", authenticateToken, messageController.sendModelMessage);

export default router;
