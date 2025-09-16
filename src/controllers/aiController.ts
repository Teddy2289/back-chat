// controllers/chatController.ts
import { Request, Response } from "express";
import { conversationService } from "../services/conversationService";
import { aiService } from "../services/aiService";
import { messageService } from "../services/messageService";

export class aiController {
  static async chatWithAI(req: Request, res: Response) {
    try {
      const { message, conversationId, history, modelData } = req.body;
      const userId = (req as any).user?.id;

      // Validation des données requises
      if (!message) {
        return res.status(400).json({ error: "Message est requis" });
      }

      // Créer une nouvelle conversation si nécessaire
      let actualConversationId = conversationId;
      if (!conversationId) {
        if (!userId || !modelData?.id) {
          return res.status(400).json({ error: "userId ou modelId manquant" });
        }

        const newConversation = await conversationService.createConversation({
          clientId: userId,
          modelId: modelData.id,
        });

        actualConversationId = newConversation.id;
      }

      // Traiter le message
      const aiResponse = await aiService.processChatMessage({
        message,
        conversationId: parseInt(actualConversationId),
        history: history || [],
        modelData,
        userId,
      });

      // Récupérer tous les messages de la conversation
      const messages = await messageService.getMessagesByConversation(
        parseInt(actualConversationId)
      );

      res.json({
        response: aiResponse,
        conversationId: parseInt(actualConversationId),
        messages, // Retourner tous les messages
      });
    } catch (error: any) {
      console.error("Error in chat controller:", error);

      if (error.message === "Conversation not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "Payment required") {
        return res.status(402).json({
          error: "Payment required",
          message:
            "Vous devez souscrire à un abonnement pour continuer à discuter",
        });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Nouveau contrôleur pour récupérer les messages d'une conversation
  static async getConversationMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      const messages = await messageService.getMessagesByConversation(
        parseInt(conversationId)
      );

      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
