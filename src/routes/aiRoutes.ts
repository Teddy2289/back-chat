// routes/chatRoutes.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { aiController } from "../controllers/aiController";

const router = Router();

router.post("/chat", authenticateToken, aiController.chatWithAI);
router.get(
  "/:conversationId/messages",
  authenticateToken,
  aiController.getConversationMessages
);

export default router;
