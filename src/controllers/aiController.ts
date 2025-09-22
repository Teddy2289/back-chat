// controllers/aiController.ts
import { Request, Response } from "express";
import { aiService } from "../services/aiService";
import { conversationService } from "../services/conversationService";

class AIController {
  async chatWithAI(req: Request, res: Response) {
    try {
      const { message, conversationId } = req.body;
      const userId = (req as any).user?.id;

      if (!message || !conversationId) {
        return res.status(400).json({
          error: "Message and conversation ID are required",
        });
      }

      const result = await aiService.processChatMessage({
        message,
        conversationId: parseInt(conversationId),
        userId,
      });

      // Émettre l'événement socket.io si une réponse IA a été générée
      if (result) {
        const io = req.app.get("socketio");
        io.to(`conversation_${conversationId}`).emit("new_message", result);
      }

      res.json({
        success: true,
        message: "Message processed successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error in chatWithAI:", error);

      // Gérer spécifiquement les erreurs de paiement requis
      if (error.message.includes("Payment required")) {
        return res.status(402).json({
          error: error.message,
          requiresPayment: true,
        });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getConversationMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = (req as any).user?.id;

      // Vérifier l'accès à la conversation
      const accessCheck = await conversationService.checkConversationAccess(
        parseInt(conversationId),
        userId
      );

      if (!accessCheck.canChat) {
        return res.status(403).json({
          error: accessCheck.error || "Access denied",
        });
      }

      const conversation = await conversationService.getConversationById(
        parseInt(conversationId)
      );

      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const aiController = new AIController();
